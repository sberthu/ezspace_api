import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { Tools } from "./tools";
import { EntrepriseInterface } from "../interfaces/entreprise_interface";
import { EntrepriseSchema } from "../schemas/entreprise_schema";

import Boom = require('boom');

export class Entreprise {
    protected static convertEntreprise(entreprise:any):EntrepriseInterface {
        return Tools.parseProperties(
            entreprise,
            ['address']);
    }
    public static async getEntreprise(_config:ConfigInterface,entreprise_id:number): Promise<EntrepriseInterface> {
        const group = await _config.redis.getHashSet(`entreprise:${entreprise_id}`);
        return Entreprise.convertEntreprise(group);
    }
    public static async getEntreprises(_config:ConfigInterface): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`entreprise`), 3, 4);
    }
    public static registerRoutes(_config:ConfigInterface):void {
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/entreprise/:entreprise_id`,
            schema: {
                params:{
                    entreprise_id: {type: 'number'}
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: EntrepriseSchema
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Entreprise.getEntreprise(_config, parseInt(request.params['entreprise_id']));
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
        _config.fastify.route({
            method: 'GET',
            url: `${_config.root_uri}/entreprises`,
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
                    return await Entreprise.getEntreprises(_config);
                } catch (err) {
                    throw Boom.boomify(err)
                }
            }
        });
    }

}