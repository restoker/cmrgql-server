import {Schema, model} from 'mongoose';

const ClientesSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    apellido: {
        type: String,
        required: true,
        trim: true,
    },
    empresa: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    telefono: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    creado: {
        type: Date,
        default: Date.now(),
    },
    vendedor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    }
});

ClientesSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ClientesSchema.set('toJSON', {
    virtuals: true,
});

export default model('Cliente', ClientesSchema);