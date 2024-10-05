export default function handler(req, res) {
    if (req.method === 'GET') {
      // Respuesta para solicitudes GET
      res.status(200).json({ mensaje: 'Hola desde la API!' });
    } else {
      // Manejo de otros métodos
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Método ${req.method} no permitido`);
    }
  }