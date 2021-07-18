import {jwt} from 'jsonwebtoken';

export class Token {
    public static create(config:any, id_presentation:string) {
        if (typeof id_presentation !== "string") {
            throw new Error("id_presentation must be a string");
        }
        let token = jwt.sign({ id_presentation }, config.jwt.private, config.jwt.options)
        return token
    }

    public static read(config:any, encrypted_token:string) {
        if (typeof encrypted_token !== "string") {
            throw new Error("encrypted_token must be a string");
        }
        let token = null;
        try {
            token = jwt.verify(encrypted_token, config.jwt.public, config.jwt.verify_options);
        } catch (ex) {
            throw new Error(ex);
        }

        return token
    }

    public static read_and_check(config:any, encrypted_token:string) {
        let uncrypted_token = null;
        try {
            uncrypted_token = Token.read(config, encrypted_token)
        } catch (err) {
            throw new Error(err);
        }
        if (uncrypted_token.aud !== config.jwt.options.audience ||
            uncrypted_token.iss !== config.jwt.options.issuer ||
            uncrypted_token.sub !== config.jwt.options.subject) {
            throw new Error("token is not good");
        }
        return uncrypted_token;
    }
}