import cron from 'node-cron'

export const testNodeCron = ()=>{
    
    cron.schedule('* * * * *', () => {
        console.log('Tarea cron ejecutada a medianoche');
        // Aquí puedes poner la lógica que desees, como realizar una llamada a la API
        // o actualizar una base de datos
      });
}
export const AddMaestros = async()=>{

}