import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { Tools } from "./tools";
import { Token } from "./token";

import Boom = require('boom');
import { resolve } from "dns";
import { rejects } from "assert";
import { User } from "./user";
import { UserInterface } from "src/interfaces/user_interface";

export class OAuth {
    public static async createToken(_config:ConfigInterface, encrypted_authentication: string):Promise<Object> {
        return new Promise((resolve, reject) => {
            resolve(Token.create(_config, encrypted_authentication));
        });
    }
    public static async refreshToken(_config:ConfigInterface, encrypted_authentication: string, refresh_token:string):Promise<Object> {
        return new Promise((resolve, reject) => {
            resolve(Token.refresh(_config, encrypted_authentication, refresh_token));
        });
    }
    public static async getJwk(_config:ConfigInterface):Promise<Object> {
        return new Promise((resolve, reject) => {
            resolve(Token.getJwk(_config));
        });
    }
    public static async generatePasswordHash(_config:ConfigInterface):Promise<any> {
        const user_ids:Array<Number> = await User.getUsers(_config);
        return await Promise.all(user_ids.map(async (user_id:number) => {
            const user:UserInterface = await User.getUser(_config, user_id);
            return await Token.computeAndSaveHash(_config, user_id, user.username, user.username);
        }))     
    }
    public static registerRoutes(_config: ConfigInterface): void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/oauth/jwk`,
            schema: {
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            keys: { 
                                type: 'array',
                                items: { 
                                    type: 'object',
                                    properties: {
                                        kty: { type: 'string'},
                                        n: { type: 'string'},
                                        e: { type: 'string'},
                                        alg: { type: 'string'},
                                        kid: { type: 'string'}
                                    }
                                }
                            }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const jwk = await OAuth.getJwk(_config);
                    return jwk
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'POST',
            url: `${_config.root_uri}/oauth/token`,
            schema: {
                body: {
                    type: 'object',
                    property: {
                        authentication: {type: 'string'}
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            token_type: { type: 'string'},
                            access_token: { type: 'string'},
                            refresh_token: { type: 'string'},
                            expire_in: { type: 'string'}
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const authentication:string = request.body['authentication'];
                    return await OAuth.createToken(_config, authentication);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'POST',
            url: `${_config.root_uri}/oauth/refresh`,
            schema: {
                body: {
                    type: 'object',
                    property: {
                        refresh_token: {type: 'string'},
                        authentication: {type: 'string'}
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            token_type: { type: 'string'},
                            access_token: { type: 'string'},
                            refresh_token: { type: 'string'},
                            expire_in: { type: 'string'}
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const refresh_token:string = request.body['refresh_token'];
                    const authentication:string = request.body['authentication'];
                    return OAuth.refreshToken(_config, authentication, refresh_token);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/oauth/generate`,
            schema: {
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'array',
                        items: { type:'string'}
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await OAuth.generatePasswordHash(_config);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
    }
}