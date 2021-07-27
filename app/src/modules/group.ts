import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { Tools } from "./tools";
import { Session } from "./session";
import { User } from "./user";
import { UserInterface } from "../interfaces/user_interface";
import { GroupInterface } from "../interfaces/group_interface";
import { LocalizationInterface } from "../interfaces/localization_interface";
import { GroupSchema } from "../schemas/group_schema";

import Boom = require('boom');

export class Group {
    protected static convertGroup(group:any):GroupInterface {
        return Tools.parseProperties(group, ['is_private']);
    }
    public static async getGroup(_config:ConfigInterface,group_id:number): Promise<GroupInterface> {
        const group = await _config.redis.getHashSet(`group:${group_id}:group`);
        return Group.convertGroup(group);
    }
    public static async getGroups(_config:ConfigInterface): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`group`), 3, 5);
    }
    public static async getUsersForGroupId(_config:ConfigInterface,group_id:number): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`group:${group_id}:users`), 5, 6);
    }
    public static async getUsersForSpecialityGroupFromUserId(_config:ConfigInterface,user_id:number): Promise<Array<number>> {
        const user:UserInterface = await User.getUser(_config, user_id);
        return  Group.getUsersForGroupId(_config,user.speciality_group_id);
    }
    public static async getUsersForWorkingGroupFromUserId(_config:ConfigInterface,user_id:number): Promise<Array<number>> {
        const user:UserInterface = await User.getUser(_config, user_id);
        return  Group.getUsersForGroupId(_config,user.working_group_id);
    }
    public static async getVisibilityForGroupId(_config:ConfigInterface,group_id:number): Promise<Array<any>> {
        const user_ids:Array<number> = await Group.getUsersForGroupId(_config, group_id);
        const visibilities:Array<any> = await Promise.all(user_ids.map(async (user_id:number) => {
            return {id:user_id, visibility:await User.getVisibilityForUserId(_config, user_id)};
        }))
        return visibilities;
    }
    public static async getFlowForGroupId(_config:ConfigInterface,group_id:number): Promise<Array<any>> {
        const user_ids:Array<number> = await Group.getUsersForGroupId(_config, group_id);
        const flows:Array<any> = await Promise.all(user_ids.map(async (user_id:number) => {
            return {id:user_id, flow:await User.getFlowForUserId(_config, user_id)};
        }))
        return flows;
    }
    public static async getLocalizationForGroupId(_config:ConfigInterface,group_id:number): Promise<Array<any>> {
        const user_ids:Array<number> = await Group.getUsersForGroupId(_config, group_id);
        const localizations:Array<any> = await Promise.all(user_ids.map(async (user_id:number) => {
            const localization:LocalizationInterface = await User.getLocalizationForUserId(_config, user_id);
            return {id:user_id, lat:localization.lat, lng:localization.lng};
        }))
        return localizations;
    }
    public static async setFlowRequest(_config:ConfigInterface, user_id: number): Promise<any> {
        return await User.setUpdates(_config, user_id, 'flow_requested', `${Date.now()}`);
    }    
    public static async setUpdateForGroupId(_config:ConfigInterface, author_id:number, group_id:number, keyname:string, value:any): Promise<Array<any>> {
        const user_ids:Array<number> = await Group.getUsersForGroupId(_config, group_id);        
        return await Promise.all(user_ids.map(async (user_id:number) => {
            if (user_id != author_id) {
                await User.setUpdateValue(_config, user_id, author_id, keyname, value);
            }
        }));
    }
    public static async getGroupIdsForGroupType(_config:ConfigInterface, group_type: string): Promise<Array<number>> {
        let group_ids:Array<number> = await Group.getGroups(_config);
        group_ids = await Promise.all(group_ids.map(async (group_id:number) => {
            const group:GroupInterface = await Group.getGroup(_config, group_id);
            const ret:boolean = Tools.hasRole(group_type, group.role)
            return ret ? group_id:null;
        }));
        return group_ids.filter(id => null != id);
    }    
    public static async getManagerIdsForGroupType(_config:ConfigInterface, group_type: string): Promise<Array<number>> {
        const group_ids:Array<number> = await Group.getGroupIdsForGroupType(_config, group_type);
        let manager_ids:Array<number> = [];
        await Promise.all(group_ids.map(async (group_id:number) => {
            const group:GroupInterface = await Group.getGroup(_config, group_id);
            manager_ids.push(group.manager_id);
            manager_ids.push(group.vice_manager_id);
        }));
        return manager_ids;
    }
    public static async getUserIdsForGroupType(_config:ConfigInterface, group_type: string): Promise<Array<number>> {
        const group_ids:Array<number> = await Group.getGroupIdsForGroupType(_config, group_type);
        let user_ids:Array<number> = [];
        await Promise.all(group_ids.map(async (group_id:number) => {
            const group_user_ids:Array<number> = await Group.getUsersForGroupId(_config, group_id);
            user_ids = user_ids.concat(group_user_ids);
        }));
        return user_ids;
    }
    public static registerRoutes(_config:ConfigInterface):void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/group/:group_id`,
            schema: {
                params:{
                    group_id: {type: 'number'}
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: GroupSchema
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Group.getGroup(_config, parseInt(request.params['group_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/groups`,
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
                    return await Group.getGroups(_config);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/group/:group_id/users`,
            schema: {
                params:{
                    group_id: {type: 'number'}
                },
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
                    return await Group.getUsersForGroupId(_config, parseInt(request.params['group_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/groups/speciality/users`,
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
                    let user_id:number = Session.getUserId(request);
                    return await Group.getUsersForSpecialityGroupFromUserId(_config, user_id);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/groups/working/users`,
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
                    let user_id:number = Session.getUserId(request);
                    return await Group.getUsersForWorkingGroupFromUserId(_config, user_id);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/group/:group_id/visibility`,
            schema: {
                params: {
                    group_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type:'object',
                            properties:{
                                id:{type: 'number'},
                                visibility: { type: 'boolean' }
                            }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Group.getVisibilityForGroupId(_config, parseInt(request.params['group_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });          
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/group/:group_id/flow`,
            schema: {
                params: {
                    group_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type:'object',
                            properties:{
                                id:{type: 'number'},
                                flow: { type: 'boolean' }
                            }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Group.getFlowForGroupId(_config, parseInt(request.params['group_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });          
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/group/:group_id/localization`,
            schema: {
                params: {
                    group_id: { type: 'number' }
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type:'object',
                            properties:{
                                id:{type: 'number'},
                                lat: { type: 'number' },
                                lng: { type: 'number' }
                            }
                        }
                    }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Group.getLocalizationForGroupId(_config, parseInt(request.params['group_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'POST',
            url: `${_config.root_uri}/group/:group_id/flowrequest`,
            schema: {
                params: {
                    group_id: { type: 'number' }
                },
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
                    await Group.setFlowRequest(_config, parseInt(request.params['group_id']));
                    return reply.statusCode = 204;                    
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });          
    }

}