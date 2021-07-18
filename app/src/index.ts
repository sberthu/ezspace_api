import { Main } from "./modules/main";
import {config as Config} from './modules/config';
import {ConfigInterface} from './interfaces/config_interface'


const config:ConfigInterface = Config();
const {fastify, redis, tools} = Main.init(config);

const init = async () => {
    Main.run(config);
}
const start = async () => {
    try {
        await config.fastify.listen(config.port, '0.0.0.0')
        config.fastify.log.info(`server listening on ${config.port}`)
    } catch (err) {
        config.fastify.log.error(err)
        process.exit(1)
    }
}


/*
const mafunc = async () => {

    const user = await redis.getHashSet(`belink:entities:users:1168:user`);
    console.log(`user:${JSON.stringify(user)}`);
    let id = JSON.parse(user.services)[0].id;
    console.log(`user:${id}`);
    
    let user2:string = await redis.getValue('drupal.redis:bootstrap:_redis_last_delete_all');
    console.log(`user:${user2}`);


}

mafunc();
*/


init();
start();

//const main = require("./modules/main")



// Run the server!

/*
db.init(config)
    .then(_ => {
        fastify.log.info(`Connected to database ${config.database.db} on host ${config.database.host}:${config.database.port} successfully !`)
        fastify.log.info(`Environment:${config.is_production ? "Production":"Development"}`)
        main.run(config)
        start(config)
    })
*/
    /* .catch(err => {
        throw new Error(`error when trying to connect to database ${config.database.db} on host ${config.database.host}:${config.database.port} : ${JSON.stringify(err, null, 2)}`);
    }) */