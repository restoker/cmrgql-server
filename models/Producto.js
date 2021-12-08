import {Schema, model} from 'mongoose';

const ProductosSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    existencia: {
        type: Number,
        required: true,
        trim: true,
    },
    precio: {
        type: Number,
        required: true,
        trim: true,
    },
    creado: {
        type: Date,
        default: Date.now(),
    }
});

ProductosSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ProductosSchema.set('toJSON', {
    virtuals: true,
});

ProductosSchema.index({nombre: 'text'});

export default model('Producto', ProductosSchema);