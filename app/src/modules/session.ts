import { FastifyRequest } from "fastify";

export class Session {
    /*public static check_token(_config:ConfigInterface, token:string|string[]):string {
        let uncrypted_token = null
        try {
            uncrypted_token = Token.read_and_check(_config, Array.isArray(token) ? token[0]:token);
        } catch (err) {
            throw boom.boomify(Tools.InvalideTokenException())
        }
        return uncrypted_token
    }*/
    public static getUserId(request:FastifyRequest):number {
        let user_id:number = 0;
        if (request.headers['x-user']) {
            const sz_user_id:string = request.headers['x-user'] as string; 
            user_id = parseInt(sz_user_id);
        }
        return user_id;
    }    
    public static getUserScopes(request:FastifyRequest):Array<string> {
        let scopes:Array<string>=[];
        if (request.headers['x-scopes']) {
            const sz_user_scopes:string = request.headers['x-scopes'] as string; 
            scopes = sz_user_scopes.split(',');
        }        
        return scopes;
    }    
}