import * as jwt from 'jsonwebtoken';
import { ConfigInterface } from '../interfaces/config_interface';
import * as rs from 'jsrsasign';
import { RsaPublicKey } from 'crypto';
import { Tools } from './tools';
import { resolve } from 'dns';
import { rejects } from 'assert';

export class Token {
    public static computeHash(username:string, password:string):string {
        const PasswordHash = require('phpass').PasswordHash;
        const passwordHash = new PasswordHash();
        const hash:string = passwordHash.hashPassword(password);
        const hashb64:string = rs.stob64(hash);
        console.log(hashb64);
        return hashb64;
    }
    public static async computeAndSaveHash(_config:ConfigInterface, user_id:number, username:string, password:string):Promise<any> {
        const hashb64:string = Token.computeHash(username, password);
        await _config.redis.setValue(`accounts:${hashb64}`, JSON.stringify({user_id, username}));
        return hashb64;
    }
    public static async create(_config:ConfigInterface, encrypted_authentication:string):Promise<Object> {
        let tohex:string = rs.b64utohex(encrypted_authentication);
        const authentication:string = rs.KJUR.crypto.Cipher.decrypt(tohex, rs.KEYUTIL.getKey(_config.jwt.private) as rs.RSAKey, "RSA");
        const authent_obj = JSON.parse(authentication);
        console.log(authent_obj);
        if (authent_obj.client_id !== _config.jwt.client_id || authent_obj.client_secret !=  _config.jwt.client_secret) {
            throw Tools.NotFoundException("client_id or client_secret not found");
        }
        //const hashKey = Token.computeHash(authent_obj.username, authent_obj.password);
        
        const PasswordHash = require('phpass').PasswordHash;
        const passwordHash = new PasswordHash();

        const hashes:Array<string> = await _config.redis.listSubKeys(`accounts`);        
        let i:number=0;
        let user_id:number | null = null;

        for (;i<hashes.length; i++) {
            const hashb64:string = hashes[i].split(':')[3];
            const hash:string = rs.b64utos(hashb64); 
            const success:boolean = passwordHash.checkPassword(authent_obj.password, hash);
            if (success) {
                const data:any = JSON.parse(await _config.redis.getValue(`accounts:${hashb64}`));
                if (data.username === authent_obj.username) {
                    user_id = data.user_id;
                    break;
                }
            }
        }
        if (!user_id) {
            throw Tools.NotFoundException("credentials not found");
        }
        const token:string = jwt.sign({ user_id:user_id }, _config.jwt.private, _config.jwt.options as jwt.SignOptions);
        const refresh_token:string = jwt.sign({ user_id:user_id }, _config.jwt.private, {..._config.jwt.options, expiresIn: _config.jwt.refresh_token_timeout} as jwt.SignOptions);
        return {   
            token_type: "Bearer",
            access_token: token,
            expire_in: _config.jwt.options.expiresIn,
            refresh_token: refresh_token
        }
    }
    public static refresh(_config:ConfigInterface, encrypted_authentication:string, refresh_token:string):Object {
        let tohex:string = rs.b64utohex(encrypted_authentication);
        const authentication:string = rs.KJUR.crypto.Cipher.decrypt(tohex, rs.KEYUTIL.getKey(_config.jwt.private) as rs.RSAKey, "RSA");
        const authent_obj = JSON.parse(authentication);
        console.log(authent_obj);
        if (authent_obj.client_id !== _config.jwt.client_id || authent_obj.client_secret !=  _config.jwt.client_secret) {
            throw Tools.NotFoundException("client_id or client_secret not found");
        }
        console.log('refresh_token:'+refresh_token)
        if (!Token.read_and_check(_config, refresh_token)) {
            throw Tools.NotFoundException("refresh_token is not valide");
        }

        const user_id:number = 1133;
        const token:string = jwt.sign({ user_id:user_id }, _config.jwt.private, _config.jwt.options as jwt.SignOptions);
        const refresh_token2:string = jwt.sign({ user_id:user_id }, _config.jwt.private, {..._config.jwt.options, expiresIn: _config.jwt.refresh_token_timeout} as jwt.SignOptions);
        return {   
            token_type: "Bearer",
            access_token: token,
            expire_in: _config.jwt.options.expiresIn,
            refresh_token: refresh_token2
        }
    }
    public static getJwk(_config:ConfigInterface):Object {
        const keyObj:rs.RSAKey = rs.KEYUTIL.getKey(_config.jwt.public) as rs.RSAKey;
        const jwk:Object = rs.KEYUTIL.getJWKFromKey(keyObj);
        return {
            keys : [
                {...jwk, ...{
                    alg: _config.jwt.alg,
                    kty: _config.jwt.kty,
                    kid: _config.jwt.kid
                }}  
            ]
        }
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