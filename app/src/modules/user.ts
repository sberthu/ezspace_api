import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback, onCloseHookHandler } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { Tools } from "./tools";
import { UserInterface } from "../interfaces/user_interface";
import { LocalizationInterface } from "../interfaces/localization_interface";
import { UserSchema } from "../schemas/user_schema";
import { Session } from "./session";

import Boom = require('boom');
import { Group } from "./group";

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
    public static async getUserByUsername(_config:ConfigInterface,username: string): Promise<number> {
        const users:Array<number> = Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`users:*`), 3, 5);
        let id:number = -1;
        let i:number = 0;
        for (; i<users.length; i++) {
            const name:string = await _config.redis.getHashString(`users:${users[i]}:user`, 'name');
            console.log(name);
            if (username == name ) {
                id = await _config.redis.getHashString(`users:${users[i]}:user`, 'id');
                break;
            }
        }
        console.log('id:' + id);
        return id;
    }
    public static async getVisibilityForUserId(_config:ConfigInterface,user_id: number): Promise<boolean> {
        const user:UserInterface = await User.getUser(_config, user_id);
        return user.visibility;
    }
    public static async getStandByForUserId(_config:ConfigInterface,user_id: number): Promise<boolean> {
        const user:UserInterface = await User.getUser(_config, user_id);        
        return user.standby;

        /*const ts:Array<string> = await _config.redis.listHashKeys(`users:${user_id}:standby`);
        if (ts.length>0q) {}
        if (ts.length>1) {
            ts.sort();
            const lastTs:string = ts[ts.length-1];
        }
        ts.sort();
        const lastTs:string = ts[ts.length-1];
        console.log(JSON.stringify(ts));
        return true;*/
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
    public static async setUserVisibility(_config:ConfigInterface, user_id: number, visibility: boolean): Promise<any> {
        return await Promise.all([
            await _config.redis.setHashValue(`users:${user_id}:user`, 'visibility', visibility),
            await User.setUpdates(_config, user_id, 'visibility', visibility)]
        );
    }
    public static async setUserStandby(_config:ConfigInterface, user_id: number, standby: boolean): Promise<any> {
        return await Promise.all([ 
            await _config.redis.setHashValue(`users:${user_id}:user`, 'standby', standby),
            await _config.redis.setHashValue(`users:${user_id}:standby`, `${Date.now()}` , standby),
            await User.setUpdates(_config, user_id, 'standby', standby)]
        );
    }
    public static async setFlow(_config:ConfigInterface, user_id: number, flow: number): Promise<any> {
        return await Promise.all([ 
            await _config.redis.setHashValue(`users:${user_id}:user`, 'flow', flow),
            await _config.redis.setHashValue(`users:${user_id}:flow`, `${Date.now()}` , flow),
            await User.setUpdates(_config, user_id, 'flow', flow)]
        );
    }
    public static async setFlowRequest(_config:ConfigInterface, user_id: number): Promise<any> {
        return await User.setUpdates(_config, user_id, 'flow_requested', `${Date.now()}`);
    }
    public static async setUserLocalization(_config:ConfigInterface, user_id: number, lat: number, lng: number): Promise<any> {
        const szLocalization:string  = JSON.stringify({
            lat:lat,
            lng:lng
        });
        return await Promise.all([
            await _config.redis.setHashValue(`users:${user_id}:user`, 'localization', szLocalization),
            await User.setUpdates(_config, user_id, 'localization', szLocalization)]
        );
    }
    public static async setUpdates(_config:ConfigInterface, author_id:number, keyName: string, value: any): Promise<any> {
        const user:UserInterface = await User.getUser(_config, author_id);
        return await Promise.all([,            
            await Group.setUpdateForGroupId(_config, author_id,user.speciality_group_id, keyName, value),
            await Group.setUpdateForGroupId(_config, author_id,user.working_group_id, keyName, value)]);
    }
    public static async setUpdateValue(_config:ConfigInterface, user_id:number, author_id:number, keyName: string, value: any): Promise<any> {
        let updates:any = await _config.redis.getValue(`users:${user_id}:updates`);
        if (updates) {
            updates = JSON.parse(updates);
        }else {
            updates = {};
        }
        if (!updates.hasOwnProperty('users')) {
            updates['users']=[];
        }
        let user_idx:number = updates.users.findIndex(u => u.id == author_id);
        if (-1 === user_idx) {
            updates.users.push({id : author_id});
            user_idx = updates.users.length-1;            
        }
        updates.users[user_idx][keyName]=value;
        return await _config.redis.setValue(`users:${user_id}:updates`, JSON.stringify(updates));
    }
    public static async getUpdates(_config:ConfigInterface, user_id:number): Promise<any> {
        const keyName:string = `users:${user_id}:updates`;
        let updates:any = await _config.redis.getValue(keyName);
        if (updates) {
            updates = JSON.parse(updates);
        }else {
            updates = {'users':[]};
        }
        await _config.redis.delKey(keyName);
        return updates;
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
                    throw Boom.boomify(err)
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
                    throw Boom.boomify(err)
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
                    throw Boom.boomify(err)
                }
            }
        });              
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/:user_id/standby`,
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
                            standby: { type: 'boolean' }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const user_id:number = parseInt(request.params['user_id']);
                    const standby:boolean = await User.getStandByForUserId(_config, user_id);
                    return {id:user_id, standby: standby};
                } catch (err) {
                    throw Boom.boomify(err)
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
                    200: UserSchema
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await User.getUser(_config, parseInt(request.params['user_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/username/:username`,
            schema: {
                params: {
                    username: { type: 'string' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    const name:string = request.params['username'];
                    const idUser:number = await User.getUserByUsername(_config, name);
                    if (idUser <0) {
                        return reply.statusCode = 404;    
                    }
                    else {
                        return {id: idUser, name: name};
                    }
                } catch (err) {
                    throw Boom.boomify(err)
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
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/user/updates`,
            schema: {
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        "additionalProperties": { "type": "string" }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    let user_id:number = Session.getUserId(request);
                    const updates:any = await User.getUpdates(_config, user_id);
                    return JSON.stringify(updates);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'PATCH',
            url: `${_config.root_uri}/user/visibility`,
            schema: {
                body: {
                    required: ['visibility'],
                    properties: {
                        visibility: {type:"boolean"}
                    }
                },
                response: {
                    204: {
                        type: 'null'
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    let user_id:number = Session.getUserId(request);
                    let visibility:boolean = request.body['visibility'];
                    await User.setUserVisibility(_config, user_id, visibility );
                    return reply.statusCode = 204;                    
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'PATCH',
            url: `${_config.root_uri}/user/localization`,
            schema: {
                body: {
                    required: ['lat', 'lng'],
                    properties: {
                        lat: {type:"number"},
                        lng: {type:"number"},
                    }
                },
                response: {
                    204: {
                        type: 'null'
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    let user_id:number = Session.getUserId(request);
                    await User.setUserLocalization(_config, user_id, request.body['lat'], request.body['lng']);
                    return reply.statusCode = 204;                    
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'PATCH',
            url: `${_config.root_uri}/user/standby`,
            schema: {
                body: {
                    required: ['standby'],
                    properties: {
                        standby: {type:"boolean"}
                    }
                },
                response: {
                    204: {
                        type: 'null'
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    let user_id:number = Session.getUserId(request);
                    await User.setUserStandby(_config, user_id, request.body['standby']);
                    return reply.statusCode = 204;                    
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'PATCH',
            url: `${_config.root_uri}/user/flowrequest`,
            schema: {
                body: {
                    type: 'null'
                },
                response: {
                    204: {
                        type: 'null'
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    let user_id:number = Session.getUserId(request);
                    await User.setFlowRequest(_config, user_id);
                    return reply.statusCode = 204;                    
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'PATCH',
            url: `${_config.root_uri}/user/flow`,
            schema: {
                body: {
                    required: ['flow'],
                    properties: {
                        flow: {type:"number"}
                    }
                },
                response: {
                    204: {
                        type: 'null'
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    let user_id:number = Session.getUserId(request);
                    await User.setFlow(_config, user_id, request.body['flow']);
                    return reply.statusCode = 204;                    
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
    }

}