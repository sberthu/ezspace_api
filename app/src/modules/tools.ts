import { HttpError} from './httpError';

export class Tools {
    public static parseProperties(obj:any, properties:string[]):any {        
        if (typeof obj === 'object' && obj !== null) {
            properties.forEach(prop => {
                if (obj.hasOwnProperty(prop) && obj[prop] != null) {
                    obj[prop] = JSON.parse(obj[prop]);
                }                
            });
        }
        return obj;
    }
    public static removeProperties(obj:any, properties:string[]):any {  
        if (typeof obj === 'object' && obj !== null) {
            properties.forEach(prop => {
                if (obj.hasOwnProperty(prop)) {
                    delete obj[prop];
                }                
            });
        }
        return obj;
    }
    public static cleanRedisIdArray(szids:Array<string>, offset:number, expected_size:number):Array<number> {
        const ids:Array<number> = szids.map(id => {
            if (id != null) {
                const el = id.split(':');
                if (el.length == expected_size) {
                    let n =parseInt(el[offset]);
                    if (!Number.isNaN(n)) {
                        return n;
                    } 
                }
            }
        });
        return ids.filter(id => null != id);
    }    
    public static convertBase(value, from_base, to_base) {
        var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var from_range = range.slice(0, from_base);
        var to_range = range.slice(0, to_base);

        value = `${value}`;
        var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
            if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `' + digit + '` for base ' + from_base + '.');
            return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
        }, 0);

        var new_value = '';
        while (dec_value > 0) {
            new_value = to_range[dec_value % to_base] + new_value;
            dec_value = (dec_value - (dec_value % to_base)) / to_base;
        }
        return new_value || '0';
    }

    public static create_id(config:any) {
        let now:any = new Date()
        let start_date:any = new Date(config.start_date);

        let ms = Math.round((now - start_date) / 1000);
        let id:number = ms * 100 + Math.round(Math.random() * 100);
        let szid:string  = this.convertBase(id, 10, 36);
        return szid;
    }

    public static NotFoundException (_message?:string) {
        const err = new HttpError(404, _message || "presentation not found");
        return err
    }
    public static InvalideTokenException (_message?:string) {
        const err = new HttpError(403, _message || "token has expired");
        return err
    }
    public static ServerError(_message?:string) {
        const err = new HttpError(501, _message || "ServerError");
        return err
    }
    public static MethodNotAllowError(_message?:string) {
        const err = new HttpError(405,_message || "the question has already been sent");
        return err
    }
    public static IsItExpired(start_date, max_duration) {
        if (!Number.isInteger(start_date) || !Number.isInteger(max_duration)) {
            throw new Error("tools.IsItExpired take two numbers (timestamp, nb_seconds)")
        }
        const now = new Date().valueOf()
        const duration = now - start_date
        //console.log(`duration: ${duration} max:${max_duration}, end:${new Date(new Date().valueOf() + max_duration)}`)
        return (duration > max_duration)
    }
}