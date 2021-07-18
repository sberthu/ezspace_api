import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "src/interfaces/config_interface";
import { boom } from 'boom';
import { Tools } from "./tools";

export class User {
    static instance: User;
    constructor(
        private readonly config: ConfigInterface
    ) {
        User.instance = this;
    }
    protected convertUser(user: any): any {
        return Tools.parseProperties(user, ['picture', 'address', 'services', 'job_type', 'localization', 'employee_type', 'roles']);
    }
    protected cleanUserIdArray(sz_user_ids: Array<string>, offset: number, expected_size:number): Array<number> {
        let user_ids = Tools.cleanRedisIdArray(sz_user_ids, offset, expected_size);
        return user_ids.filter(id => id >= this.config.min_user_id);
    }

    public async getUser(user_id: number): Promise<string> {
        let user = await this.config.redis.getHashSet(`users:${user_id}:user`);
        //console.log(user);
        return this.convertUser(user);
    }
    public async getUsers(): Promise<Array<number>> {
        return this.cleanUserIdArray(await this.config.redis.listSubKeys(`users`), 3, 5);
    }
    public async getUsersForGroupId(group_id: number): Promise<Array<number>> {
        return this.cleanUserIdArray(await this.config.redis.listSubKeys(`groups:${group_id}:users`), 5, 6);
    }
    public registerRoutes(): void {
        this.config.fastify.route({
            method: 'GET',
            url: `${this.config.root_uri}/user/:user_id`,
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
                            status: { type: 'string' },
                            name: { type: 'string' },
                            firstname: { type: 'string' },
                            email: { type: 'string' },
                            working_group_id: { type: 'number' },
                            speciality_group_id: { type: 'number' },
                            picture: { type: 'array' },
                            birthday: { type: 'string' },
                            localization: {
                                type: 'object',
                                lat: { type: 'number' },
                                lng: { type: 'number' },
                            },
                            address: { type: 'array' },
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
                    return await this.getUser(parseInt(request.params['user_id']));
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        });
        this.config.fastify.route({
            method: 'GET',
            url: `${this.config.root_uri}/users`,
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
                    return await this.getUsers();
                } catch (err) {
                    throw boom.boomify(err)
                }
            }
        })
    }

}