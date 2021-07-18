import * as redis from 'redis';
import { ConfigInterface } from './../interfaces/config_interface';
import { promisify } from 'util'


export class RedisService {
  private static instance:RedisService;

  private config:ConfigInterface;
  private redisClient: any;

  private async_hgetall:Function;
  private async_get:Function;
  private async_set:Function;
  private async_keys:Function;

  static getInstance(_config:ConfigInterface) {
    if (RedisService.instance == null) {
      RedisService.instance  = new RedisService(_config);
    }
    return RedisService.instance;
  }

  constructor(_config:ConfigInterface) { 
    this.config = _config;
    this.redisClient = redis.createClient(_config.redis_params.url);
    this.async_hgetall = promisify(this.redisClient.hgetall).bind(this.redisClient);    
    this.async_get = promisify(this.redisClient.get).bind(this.redisClient);    
    this.async_set = promisify(this.redisClient.set).bind(this.redisClient);    
    this.async_keys = promisify(this.redisClient.keys).bind(this.redisClient);    
  }

  public setValue(path: string, value: any, expire: any = null): Promise<any> {
    try {
      if (typeof value !== "string") {
        value = JSON.stringify(value)
      }
      if (expire) {
        return this.async_set(this.computeFullKey(path), value, "EX", Number.parseInt(expire))
      }else {
        return this.async_set(this.computeFullKey(path), value)
      }
    } catch (e) {
      throw e;
    }
  }

  public async getValue(path: string): Promise<any> {
    try {
      return await this.async_get(this.computeFullKey(path));
    } catch (e) {
      throw e;
    }
  }  
  public listSubKeys(path: string): Promise<any> {
    try {
      return this.async_keys(`${this.computeFullKey(path)}:*`);
    } catch (e) {
      throw e;
    }
  }
  public async getHashSet(path: string): Promise<any> {
    try {
      return await this.async_hgetall(this.computeFullKey(path));
    } catch (e) {
      throw e;
    }
  }

  protected computeFullKey(key:string):string {
    return `${this.config.redis_params.prefix}:${key}`;
  }
}
