import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { ConfigInterface } from "../interfaces/config_interface";
import { boom } from 'boom';
import { Tools } from "./tools";
import { Session } from "./session";
import { User } from "./user";
import { UserInterface } from "src/interfaces/user_interface";
import { HostInterface } from "src/interfaces/host_interface";
import { LocalizationInterface } from "src/interfaces/localization_interface";

export class Host {
    protected static convertHost(host:any):HostInterface {
        return Tools.parseProperties(
            Tools.removeProperties(host, ['vote']),
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
                    200: {
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "definitions": {
                                "AddressInterface": {
                                    "properties": {
                                        "address_line1": {
                                            "type": "string"
                                        },
                                        "address_line2": {
                                            "type": "string"
                                        },
                                        "locality": {
                                            "type": "string"
                                        },
                                        "organization": {
                                            "type": "string"
                                        },
                                        "postal_code": {
                                            "type": "string"
                                        }
                                    },
                                    "type": "object"
                                },
                                "HourInterface": {
                                    "properties": {
                                        "comment": {
                                            "type": "string"
                                        },
                                        "day": {
                                            "type": "number"
                                        },
                                        "endhours": {
                                            "type": "number"
                                        },
                                        "starthours": {
                                            "type": "number"
                                        }
                                    },
                                    "type": "object"
                                },
                                "LocalizationInterface": {
                                    "properties": {
                                        "lat": {
                                            "type": "number"
                                        },
                                        "lng": {
                                            "type": "number"
                                        }
                                    },
                                    "type": "object"
                                },
                                "PictureInterface": {
                                    "properties": {
                                        "alt": {
                                            "type": "string"
                                        },
                                        "id": {
                                            "type": "number"
                                        },
                                        "label": {
                                            "type": "string"
                                        },
                                        "url": {
                                            "type": "string"
                                        }
                                    },
                                    "type": "object"
                                },
                                "TermInterface": {
                                    "properties": {
                                        "id": {
                                            "type": "number"
                                        },
                                        "machine_name": {
                                            "type": "string"
                                        },
                                        "name": {
                                            "type": "string"
                                        }
                                    },
                                    "type": "object"
                                }
                            },
                            "properties": {
                                "address": {
                                    "items": {
                                        "$ref": "#/definitions/AddressInterface"
                                    },
                                    "type": "array"
                                },
                                "author_id": {
                                    "type": "number"
                                },
                                "bus_access": {
                                    "type": "string"
                                },
                                "content": {
                                    "type": "string"
                                },
                                "coverage_picture": {
                                    "items": {
                                        "$ref": "#/definitions/PictureInterface"
                                    },
                                    "type": "array"
                                },
                                "created_date": {
                                    "type": "number"
                                },
                                "hours": {
                                    "items": {
                                        "$ref": "#/definitions/HourInterface"
                                    },
                                    "type": "array"
                                },
                                "id": {
                                    "type": "number"
                                },
                                "import_id": {
                                    "type": "string"
                                },
                                "is_internal": {
                                    "type": "boolean"
                                },
                                "label": {
                                    "type": "string"
                                },
                                "localization": {
                                    "$ref": "#/definitions/LocalizationInterface"
                                },
                                "manager_id": {
                                    "type": "number"
                                },
                                "parking_access": {
                                    "type": "string"
                                },
                                "phone": {
                                    "type": "string"
                                },
                                "pictures": {
                                    "items": {
                                        "$ref": "#/definitions/PictureInterface"
                                    },
                                    "type": "array"
                                },
                                "plain_address": {
                                    "type": "string"
                                },
                                "price": {
                                    "type": "string"
                                },
                                "services": {
                                    "items": {
                                        "$ref": "#/definitions/TermInterface"
                                    },
                                    "type": "array"
                                },
                                "subway_access": {
                                    "type": "string"
                                },
                                "timezone": {
                                    "type": "string"
                                },
                                "tram_access": {
                                    "type": "string"
                                },
                                "type": {
                                    "items": {
                                        "$ref": "#/definitions/TermInterface"
                                    },
                                    "type": "array"
                                },
                                "type_of_contract": {
                                    "items": {
                                        "$ref": "#/definitions/TermInterface"
                                    },
                                    "type": "array"
                                },
                                "updated_date": {
                                    "type": "number"
                                },
                                "vote": {
                                    "items": {
                                    },
                                    "type": "array"
                                }
                            },
                            "type": "object"
                        }
                }
            },
            handler: async (request: FastifyRequest, reply: any) => {
                try {
                    return await Host.getHost(_config, parseInt(request.params['host_id']));
                } catch (err) {
                    throw boom.boomify(err)
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
                    throw boom.boomify(err)
                }
            }
        });
    }

}