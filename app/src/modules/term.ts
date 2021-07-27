import { ConfigInterface } from "../interfaces/config_interface";
import { TermInterface } from "../interfaces/term_interface";
import { Tools } from "./tools";

export class Term {
    public static async searchTermByVidAndMachineName(_config:ConfigInterface,vid:string,machine_name:string): Promise<TermInterface | null> {
        const ids: Array<number> = Tools.cleanRedisIdArray(await _config.redis.listSubKeys(`term:${vid}`), 4, 5);
        let i:number = 0;
        for(;i<ids.length; i++) {
            const term:any = await _config.redis.getHashSet(`term:${vid}:${ids[i]}`);
            if (term['machine_name'] == machine_name) {
                return term as TermInterface;
            }
        }
        return null;       
    }
}