import mongoose from "mongoose";
import { getPivotDataSource, runDynamicQuery3, transformarObjetos } from "../../utils/funcionesParaCalcularCubo";
import dbConnect from "../../lib/mongodb";
import b2bventas2Model from "../../models/b2bventas2.model";

export default async function  handler(req, res) {
      // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Cambia '*' a tu dominio específico en producción
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    await dbConnect();
    if (req.method === 'GET') {
      // Respuesta para solicitudes GET

      res.status(200).json({ mensaje: 'Hola desde la API!' });
    } 
    if (req.method === 'OPTIONS') {
        // Responde a las solicitudes preflight
        res.status(200).end();
        return;
      }
    else if(req.method==='POST')
    {
        console.log('qwdqwd')
        const { Filas,Columnas,Filtros,Valores } = req.body
            try {
                // console.log(req.body)
                // console.log(Valores)
                // const formattedData = transformarObjetos(Valores.Valores);
                // // console.log(Filtros)
                // console.log(formattedData)
                const query = {
                    rows: Filas,
                    // ['Periodo','Sucursal']
                    columns: Columnas,
                    // ['Periodo','Sucursal']
                    values: Valores,
                    // {
                        
                    // //   COBERTURA: { operation: 'COUNT', distinct: true },
                    // //   PEDIDOS: { operation: 'COUNT' },
                    //   ValorVenta: { operation: 'SUM' }
                    // },
                    filters: { PKIDProveedor: '90005' }
                    // filters: { PKIDProveedor: '90005' }
                };
                // console.log(formattedData)
                console.log(query)
                console.log(JSON.stringify(query))
                const Pipelina = runDynamicQuery3(query)
                console.log(JSON.stringify(Pipelina))
                console.log(Pipelina)
                // console.log(Pipelina[0])
                // const test = await b2bventas2Model.find({}).limit(10)
                // console.log(test)
                const FiltracionMaxima = await b2bventas2Model.aggregate(Pipelina)
               
                const pivotDataSource = getPivotDataSource(query,FiltracionMaxima)
                // console.log(FiltracionMaxima)
                res.status(200).json({
                    pivotDataSource:pivotDataSource,
                    pipeline:Pipelina
                })
            
           
    
        } catch (error) {
            console.log(error)
    
            res.status(500).json({message:'Error'})   
        }
    }

    else {
      // Manejo de otros métodos
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Método ${req.method} no permitido`);
    }
  }