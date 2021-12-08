import {Schema, model} from 'mongoose';

const UsuarioSchema = new Schema({
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
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    creado: {
        type: Date,
        default: Date.now(),
    }
});

UsuarioSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

UsuarioSchema.set('toJSON', {
    virtuals: true,
});

export default model('Usuario', UsuarioSchema);