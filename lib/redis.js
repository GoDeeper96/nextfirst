
import { createClient } from "redis";

export const InitClientRedisOtherOther = ()=>{
    const clt = createClient({
   

        // password:process.env.redisip,
        socket:{
            host:'127.0.0.1',        
            port:6379
        },
        legacyMode: true
    })
    return clt;
    // return Client;
}
