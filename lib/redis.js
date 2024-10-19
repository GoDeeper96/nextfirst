
import { createClient } from "redis";

export const InitClientRedisOtherOther = ()=>{
    const clt = createClient({
   

        // password:process.env.redisip,
        socket:{
            host:'6379',        
            port:'127.0.0.1'
        },
        legacyMode: true
    })
    return clt;
    // return Client;
}
