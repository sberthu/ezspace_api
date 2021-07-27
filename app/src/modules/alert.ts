import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { Tools } from "./tools";
import { AlertInterface } from "../interfaces/alert_interface";
import { AlertSchema } from "../schemas/alert_schema";
import { Session } from "./session";

import Boom = require('boom');
import { TermInterface } from "../interfaces/term_interface";
import { Term } from "./term";
import { AlertConfig } from "./alert_config";
import { AlertConfigInterface } from "../interfaces/alert_config_interface";
import { Group } from "./group";

export class Alert {
    protected static convertAlert(alert:any):AlertInterface {
        return Tools.parseProperties(
            Tools.removeProperties(alert, ['scope']),
            ['localization','scope','status','type']);
    }
    public static async getAlert(_config:ConfigInterface,alert_id:number): Promise<AlertInterface> {
        const group = await _config.redis.getHashSet(`alert:${alert_id}:alert`);
        return Alert.convertAlert(group);
    }
    public static async getAlertForUserId(_config:ConfigInterface, user_id:number): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`users:${user_id}:alerts`), 5, 6);
    }
    protected static async getUserIdsFromAlertTypeAndUserId(_config:ConfigInterface, type:TermInterface, user_id:number):Promise<Array<number>> {
        if (!AlertConfig.hasOwnProperty(type.machine_name)) {
            throw Error('Alert type not found');
        }
        let user_ids:Array<number> = [];
        const alert_config:AlertConfigInterface = AlertConfig[type.machine_name];
        await Promise.all(alert_config.managers.map(async (group_type:string) => {
            const manager_ids:Array<number> = await Group.getManagerIdsForGroupType(_config, group_type);
            user_ids = user_ids.concat(manager_ids);
            return group_type;            
        }));
        await Promise.all(alert_config.members.map(async (group_type:string) => {
            const manager_ids:Array<number> = await Group.getUserIdsForGroupType(_config, group_type);
            user_ids = user_ids.concat(manager_ids);
            return group_type;
        }));
        user_ids = Tools.removeDuplicatesAndNotNull(user_ids);
        return user_ids;
    }
    public static async setAlertForUserId(_config:ConfigInterface, user_id:number, params:Object):Promise<Object> {
        const user_ids:Array<number> = await Alert.getUserIdsFromAlertTypeAndUserId(_config, params['type'], user_id);
        return await Promise.all(user_ids.map(async (user_id:number) => {
            
        }));        
        return null;; 
    }
    public static async setDefaultParams(_config:ConfigInterface, request: FastifyRequest):Promise<Object | null> {
        let params:Object = null;
        const type: TermInterface | null = await Term.searchTermByVidAndMachineName(_config, 'bl_tx_alert_type', request.body['type']);
        if (type) {
            params = {
                'id':Session.getUserId(request),
                'level': request.body.hasOwnProperty('level') ? parseInt(request.body['level']) : 0,
                'content': request.body.hasOwnProperty('content') ? request.body['content'] : '',
                'localization': {lat: parseFloat(request.body['lat']), lng: parseFloat(request.body['lat'])},
                'type': type
            };
        }
        return params; 
    }
    public static registerRoutes(_config:ConfigInterface):void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/alert/:alert_id`,
            schema: {
                params:{
                    alert_id: {type: 'number'}
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: AlertSchema
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Alert.getAlert(_config, parseInt(request.params['alert_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/alert/mine`,
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
                    return await Alert.getAlertForUserId(_config, user_id);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'POST',
            url: `${_config.root_uri}/alert`,
            schema: {
                body: {
                    required: ['localization', 'type'],
                    properties: {
                        localization: {
                            type:"object",
                            properties: {
                                lat: {type: 'string'},
                                lng: {type: 'string'}
                            }
                        },
                        type: {type:"string"},
                        content: {type:"string"},
                        level: {type:"number"}
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
                    let params:Object | null = await Alert.setDefaultParams(_config, request);
                    if (null != params) {
                        return await Alert.setAlertForUserId(_config, user_id, params);
                    }else {
                        reply.status(404).send({ error: 'alert type not found' });
                    }
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
    }

}