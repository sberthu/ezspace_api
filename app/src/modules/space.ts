import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { boom } from 'boom';
import { Tools } from "./tools";
import { SpaceInterface } from "../interfaces/space_interface";
import { SpaceSchema } from "../schemas/space_schema";

export class Space {
    protected static convertSpace(space:any):SpaceInterface {
        return Tools.parseProperties(
            Tools.removeProperties(space, ['import_id', 'hourly_rate', 'day_rate', 'half_day_rate', 'weekly_rate', 'monthly_rate']),
            ['is_disabled_person','hours','is_place_provided','pictures','coverage_picture','services','space_types']);
    }
    public static async getSpace(_config:ConfigInterface,space_id:number): Promise<SpaceInterface> {
        const group = await _config.redis.getHashSet(`espace:${space_id}`);
        return Space.convertSpace(group);
    }
    public static async getSpaces(_config:ConfigInterface): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`espace`), 3, 4);
    }
    public static registerRoutes(_config:ConfigInterface):void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/space/:space_id`,
            schema: {
                params:{
                    space_id: {type: 'number'}
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: SpaceSchema
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Space.getSpace(_config, parseInt(request.params['space_id']));
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/spaces`,
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
                    return await Space.getSpaces(_config);
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
    }

}