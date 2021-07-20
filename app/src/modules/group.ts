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
        const group = await _config.redis.getHashSet(`groups:${group_id}:group`);
        return Group.convertGroup(group);
    }
    public static async getGroups(_config:ConfigInterface): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`groups`), 3, 5);
    }
    public static async getUsersForGroupId(_config:ConfigInterface,group_id:number): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`groups:${group_id}:users`), 5, 6);
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
    }

}