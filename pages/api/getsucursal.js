import dbConnect from "../../lib/mongodb";
import { InitClientRedisOtherOther } from "../../lib/redis";

export default async function handler(req,res){
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Cambia '*' a tu dominio específico en producción
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  await dbConnect();
  const pool = await InitClientRedisOtherOther().connect()
  if (req.method === 'GET') {
    // Respuesta para solicitudes GET
    try {
      const periodo = await pool.v4.GET('Sucursal')
      const data = JSON.parse(periodo)
      res.status(200).json(data);
    } catch (error) {
      console.log(error)
    
            res.status(500).json({message:'Error'})   
    }
   
  } 
}