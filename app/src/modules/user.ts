import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { boom } from 'boom';
import { Tools } from "./tools";
import { UserInterface } from "src/interfaces/user_interface";
import { LocalizationInterface } from "src/interfaces/localization_interface";

export class User {

    protected static convertUser(user: any): UserInterface {
        return Tools.parseProperties(user, ['standby', 'flow_requested', 'visibility', 'status', 'picture', 'address', 'services', 'job_type', 'localization', 'employee_type', 'roles']);
    }
    protected static cleanUserIdArray(_config:ConfigInterface, sz_user_ids: Array<string>, offset: number, expected_size:number): Array<number> {
        const user_ids = Tools.cleanRedisIdArray(sz_user_ids, offset, expected_size);
        return user_ids.filter(id => id >= _config.min_user_id);
    }
    public static async getUser(_config:ConfigInterface,user_id: number): Promise<UserInterface> {
        const user = await _config.redis.getHashSet(`users:${user_id}:user`);
        return User.convertUser(user);
    }
    public static async getVisibilityForUserId(_config:ConfigInterface,user_id: number): Promise<boolean> {
        const user:UserInterface = await User.getUser(_config, user_id);
        return user.visibility;
    }
    public static async getFlowForUserId(_config:ConfigInterface,user_id: number): Promise<number> {
        const user:UserInterface = await User.getUser(_config, user_id);
        return user.flow;
    }
    public static async getLocalizationForUserId(_config:ConfigInterface,user_id: number): Promise<LocalizationInterface> {
        const user:UserInterface = await User.getUser(_config, user_id);
        return user.localization;
    }
    public static async getUsers(_config:ConfigInterface): Promise<Array<number>> {
        return User.cleanUserIdArray(_config, await _config.redis.listSubKeys(`users`), 3, 5);
    }
    public static registerRoutes(_config:ConfigInterface): void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/:user_id/visibility`,
            schema: {
                params: {
                    user_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            visibility: { type: 'boolean' }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const user_id:number = parseInt(request.params['user_id']);
                    const visibility:boolean = await User.getVisibilityForUserId(_config, user_id);
                    return {id:user_id, visibility: visibility};
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });              
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/:user_id/flow`,
            schema: {
                params: {
                    user_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            flow: { type: 'number' }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const user_id:number = parseInt(request.params['user_id']);
                    const flow:number = await User.getFlowForUserId(_config, user_id);
                    return {id:user_id, flow: flow};
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });              
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/:user_id/localization`,
            schema: {
                params: {
                    user_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            lat: { type: 'number' },
                            lng: { type: 'number' }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const user_id:number = parseInt(request.params['user_id']);
                    const localization:LocalizationInterface = await User.getLocalizationForUserId(_config, user_id);
                    return {id:user_id, lat: localization.lat, lng:localization.lng};
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });              
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/:user_id`,
            schema: {
                params: {
                    user_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            status: { type: 'boolean' },
                            name: { type: 'string' },
                            firstname: { type: 'string' },
                            email: { type: 'string' },
                            working_group_id: { type: 'number' },
                            speciality_group_id: { type: 'number' },
                            picture: { type: 'array' },
                            birthday: { type: 'string' },
                            localization: {
                                type: 'object',
                                properties: {
                                    lat: { type: 'number' },
                                    lng: { type: 'number' }
                                }
                            },
                            address: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        address_line1: { type: 'string' },
                                        address_line2: { type: 'string' },
                                        locality: { type: 'string' },
                                        postal_code: { type: 'string' }
                                    }, "additionalProperties": {type: 'string'}
                                }
                            },
                            company: { type: 'number' },
                            services: {
                                type: 'array',
                                items: {
                                    id: { type: 'number' },
                                    machine_name: { type: 'string' },
                                    name: { type: 'string' }
                                }
                            },
                            function: { type: 'string' },
                            job_type: {
                                type: 'array',
                                items: {
                                    id: { type: 'number' },
                                    machine_name: { type: 'string' },
                                    name: { type: 'string' }
                                }
                            },
                            employee_type: {
                                type: 'array',
                                items: {
                                    id: { type: 'number' },
                                    machine_name: { type: 'string' },
                                    name: { type: 'string' }
                                }
                            },
                            roles: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            phone: { type: 'string' },
                            updates: { type: 'string' },
                            flow_requested: { type: 'boolean' },
                            flow: { type: 'number' },
                            visibility: { type: 'boolean' },
                            standby: { type: 'boolean' },
                            nb_connexions: { type: 'number' },
                            last_access_date: { type: 'number' },
                            created_date: { type: 'number' },
                            updated_date: { type: 'number' },
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await User.getUser(_config, parseInt(request.params['user_id']));
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/users`,
            schema: {
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'array',
                        items: { type: 'number' }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await User.getUsers(_config);
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
    }

}