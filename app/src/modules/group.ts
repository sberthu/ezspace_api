import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "src/interfaces/config_interface";
import { boom } from 'boom';
import { Tools } from "./tools";
import { Session } from "./session";
import { User } from "./user";

export class Group {
    static instance:Group;
    constructor(
        private readonly config: ConfigInterface
    ) {
        Group.instance = this;
    }
    protected convertGroup(group:any):any {
        return group;
    }
    protected async getGroup(group_id:number): Promise<string> {
        let group = await this.config.redis.getHashSet(`groups:${group_id}:group`);
        return this.convertGroup(group);
    }
    protected async getGroups(): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await this.config.redis.listSubKeys(`groups`), 3, 5);
    }
    protected async getUsersForGroupId(group_id:number): Promise<Array<number>> {
        return  Tools.cleanRedisIdArray(await this.config.redis.listSubKeys(`groups:${group_id}:users`), 5, 6);
    }
    protected async getUsersForSpecialityGroupFromUserId(user_id:number): Promise<Array<number>> {
        let user:any = 
        return  Tools.cleanRedisIdArray(await this.config.redis.listSubKeys(`groups:${group_id}:users`), 5, 6);
    }
    public registerRoutes():void {
        this.config.fastify.route({
            method: 'GET',
            url: `${this.config.root_uri}/group/:group_id`,
            schema: {
                params:{
                    group_id: {type: 'number'}
                },
                body: {
                    type: 'null'
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            label: { type: 'string' },
                            description: { type: 'string' },
                            is_private: { type: 'boolean' },
                            author_id: { type: 'number' },
                            manager_id: { type: 'number' },
                            vice_manager_id: { type: 'number' },
                            role: { type: 'string' },
                            updated_date: { type: 'number' },
                            created_date: { type: 'number' },
                        }
                      }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await this.getGroup(parseInt(request.params['group_id']));
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
        this.config.fastify.route({
            method: 'GET',
            url: `${this.config.root_uri}/groups`,
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
                    return await this.getGroups();
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
        this.config.fastify.route({
            method: 'GET',
            url: `${this.config.root_uri}/group/:group_id/users`,
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
                    return await this.getUsersForGroupId(parseInt(request.params['group_id']));
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
        this.config.fastify.route({
            method: 'GET',
            url: `${this.config.root_uri}/groups/speciality/users`,
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
                    return await this.getUsersForSpecialityGroupFromUserId(user_id);
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
    }

}