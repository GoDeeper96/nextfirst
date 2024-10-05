
import { createClient } from "redis";

export const InitClientRedisOtherOther = ()=>{
    const clt = createClient({
   

        // password:process.env.redisip,
        socket:{
            host:process.env.redis_ip,        
            port:process.env.redis_port
        },
        legacyMode: true
    })
    return clt;
    // return Client;
}
