// models/Venta.js
import mongoose from 'mongoose';

const VentaSchema = new mongoose.Schema({
    Periodo: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    CodSupervisor: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    NroDocSupervisor: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    Codigo: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    ValorVenta: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    CantidadUnitaria: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    NomVen: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    Sucursal: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    Nombre: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    codclie: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    FV: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    Descripcion: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    Fecha: {
        type: Date,
        default: null,
        required: false,
        index: true
    },
    Marca: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    provnom: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    ConcaPedido: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    Grupo: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    IDCaracteristica4: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    SubProveedor: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    codprod: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    EsBonificacion: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    linea: {
        type: String,
        default: null,
        required: false,
        index: true
    },
    PKIDProveedor: {
        type: String,
        default: null,
        required: false,
        index: true
    }
}, { 
    timestamps: true,
    // collection:'ventas'
}
);
const b2bventas2Model = mongoose.models['90005'] 
? mongoose.model('90005') 
: mongoose.model('90005', VentaSchema);

export default b2bventas2Model
// export default b2bventas2Model