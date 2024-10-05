import mongoose from 'mongoose';

const MONGODB_URI = `mongodb://127.0.0.1:27017/analytics-b2b?appName=mongosh+2.1.4`; // Asegúrate de definir esta variable de entorno


async function dbConnect() {
    const connectionState = mongoose.connection.readyState
    if(connectionState===1)
    {
        console.log('YA ESTA CONECTADO')
        return;
    }
    if(connectionState===2)
    {
        console.log('Conectando...')
        return;
    }
    try {
        await mongoose.connect(MONGODB_URI,{
            bufferCommands:true
        })
        console.log('conectado')
    } catch (error) {
        console.log(error)
        throw new Error("error",error)
    }

  }
  

export default dbConnect;