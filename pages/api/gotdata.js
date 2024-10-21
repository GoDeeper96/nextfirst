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

    res.status(200).json({ mensaje: 'Hola desde la API!' });
  } 
  if (req.method === 'OPTIONS') {
      // Responde a las solicitudes preflight
      res.status(200).end();
      return;
    }
  if (req.method === 'POST') {
    const { Columna } = req.body
    console.log(Columna)
    // Respuesta para solicitudes GET
    try {
        const datita = await pool.v4.GET(Columna)
        const daton = JSON.parse(datita)
        res.status(200).json(daton);
    } catch (error) {
        console.log(error)
    
            res.status(500).json({message:'Error'})   
    }
 
  } 
}