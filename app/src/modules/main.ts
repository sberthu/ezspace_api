import { RedisService as Redis} from "./redis.service";
import fastify from 'fastify'
import * as Cors from 'fastify-cors'
import { Tools as tools } from './tools';
import { Token, Token as token}  from './token';
import {ConfigInterface} from '../interfaces/config_interface'
import { User } from "./user";
import { Group } from "./group";
import { Host } from "./host";
import { Space } from "./space";
import { Entreprise } from "./entreprise";
import { Alert } from "./alert";

/*const cors = require('fastify-cors');
*/

export class Main {
  public static init = (_config:ConfigInterface) => {
    const redis = Redis.getInstance(_config);
    _config.redis = redis;
    _config.fastify = fastify({
      logger: _config.debug
    });    
    return {fastify, redis, tools};  
  }

  public static run = (_config:ConfigInterface) => {
    // Declare a route
    _config.fastify.get('/', async (request, reply) => {
      return { hello: 'world' }
    })
  
   /* _config.fastify.register(Cors, {/* 
      origin: "*",
      methods: ['GET,PUT,POST, DELETE, OPTIONS'],
      optionsSuccessStatus: true,
      preflightContinue: true */
    /*});*/

    //_config.fastify.register(user.get_user);
    User.registerRoutes(_config);
    Group.registerRoutes(_config);
    Host.registerRoutes(_config);
    Space.registerRoutes(_config);
    Entreprise.registerRoutes(_config);
    Alert.registerRoutes(_config);
   /*  fastify.route({
      method: 'OPTIONS',
      path: '*'
    }, (request, reply) => { reply.send() })
     */
    /*fastify.register(presentation.post_presentation)
    fastify.register(presentation.delete_presentation)
    fastify.register(question.post_question)
    fastify.register(question.delete_question)
    fastify.register(participant.get_scores)
    fastify.register(participant.get_presentation)
    fastify.register(participant.delete_participant)
    fastify.register(participant.get_state)
    fastify.register(participant.post_response)*/    
  }
}
