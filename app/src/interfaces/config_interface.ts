import { FastifyInstance } from "fastify"; "fastify";
import { RedisService } from "src/modules/redis.service";

export interface ConfigInterface {
	trace(string): void;
	fastify: FastifyInstance;
	is_production: boolean;
	debug: boolean;
	timestamp: Date;
	port: number;
	api_version: string;
	root_uri: string;
	start_date: string;
	min_user_id:number,
	session_max_duration_in_seconds: number;
	redis: RedisService;
	redis_params: {
		active: boolean,
		prefix: string,
		url: string
	},
	user: {
		id:number,
		scopes:Array<string>
	}
	jwt: {
		refresh_token_timeout:number,
		client_id:string,
		client_secret: string,
		alg: string,
		kty: string,
		kid:string,
		private: string,
		public: string,
		options: {
			issuer: string,
			subject: string,
			audience: string,
			expiresIn: string,
			algorithm: string,
		},
		verify_options: {
			issuer: string,
			subject: string,
			audience: string,
			expiresIn: string,
			algorithms: Array<string>
		}
	}
}