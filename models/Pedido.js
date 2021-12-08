import {Schema, model} from 'mongoose';

const PedidosSchema = new Schema({
    pedido: {
        type: Array,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true,
    },
    vendedor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario', 
    },
    estado: {
        type: String,
        default: 'PENDIENTE'
    },
    creado: {
        type: Date,
        default: Date.now(),
    }
});

PedidosSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

PedidosSchema.set('toJSON', {
    virtuals: true,
});


export default model('Pedido', PedidosSchema);