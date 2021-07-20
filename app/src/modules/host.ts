import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { Tools } from "./tools";
import { HostInterface } from "../interfaces/host_interface";
import { HostSchema } from "../schemas/host_schema";

import Boom = require('boom');

export class Host {
    protected static convertHost(host:any):HostInterface {
        return Tools.parseProperties(
            Tools.removeProperties(host, ['import_id','vote']),
            ['type_of_contract','pictures','is_internal','localization','coverage_picture','hours','type','services','address']);
    }
    public static async getHost(_config:ConfigInterface,host_id:number): Promise<HostInterface> {
        const group = await _config.redis.getHashSet(`hote:${host_id}`);
        return Host.convertHost(group);
    }
    public static async getHosts(_config:ConfigInterface): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`hote`), 3, 4);
    }
    public static registerRoutes(_config:ConfigInterface):void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/host/:host_id`,
            schema: {
                params:{
                    host_id: {type: 'number'}
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: HostSchema
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Host.getHost(_config, parseInt(request.params['host_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/hosts`,
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
                    return await Host.getHosts(_config);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
    }

}