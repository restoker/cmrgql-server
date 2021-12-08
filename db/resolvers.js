require('dotenv').config();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Producto from "../models/Producto";
import Cliente from "../models/Cliente";
import Usuario from "../models/Usuario";
import { UserInputError } from "apollo-server-express";
import { isValidObjectId } from "mongoose";
import Pedido from '../models/Pedido';

const resolvers = {
    Query: {
        obtenerUsuario: async (_, {}, ctx) => {
            // const usuarioId = await jwt.verify(token, process.env.SECRETA);
            // informacion que se recive del verify
            // {
            //     id: '612540cb708c84219c4eb1f6',
            //     nombre: 'milthon',
            //     email: 'correo@correo.com',
            //     iat: 1629837074,
            //     exp: 1630441874
            // }
            if(!ctx) throw new Error('No tiene Permisos, para realizar esta operación');
            return ctx;
        },
        obtenerProductos: async (_, {}) => {
            try {
                const productos = await Producto.find().sort({'creado': -1});
                return productos;
            } catch (e) {
                console.log(e);
                if (e.message.startsWith('Database Error: ')) {
                    return new Error('Internal server error');
                }
            }
        },
        obtenerProducto: async (_, {id}, ctx) => {
            // console.log(id);
             // verificar si el id de la orden es valido
            if(!isValidObjectId(id)){
                throw new Error('El Producto no valido'); 
            } 
            try {
                const producto = await Producto.findById(id);
                // verificar si el producto existe
                if(!producto) throw new Error('El producto no existe');
                return producto;
                
            } catch (e) {
                console.log(e);
                if (e.message.startsWith('Database Error: ')) {
                    return new Error('Internal server error');
                }
            }
        },
        obtenerClientes: async (_, {}, ctx) => {
            // verificar si hay token
            try {
                const clientes = await Cliente.find();
                return clientes;
            } catch (e) {
                return new Error('Internal server error');
            }
        },
        obtenerClientesUsuario: async (_, {id}, ctx) => {
            // verificar que el usuario es quien obtiene los clientes
            if(id !== ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }

            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }

            try {
                const clientes = await Cliente.find({'vendedor': id});
                return clientes;
            } catch (e) {
                return new Error('Internal server error');
            }
        },
        obtenerCliente: async (_, {id}, ctx) => {
            // verificar que el usuario es quien obtiene los clientes
            if(!ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }

            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }
            // verficiar si el cliente existe
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('El cliente seleccionado no existe');
            }

            if (cliente.vendedor.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales');
            }
            return cliente;
        },
        obtenerPedidos:async (_, {}, ctx) => {
            // verificar que el usuario es quien obtiene los clientes
            if(!ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }
            try {
                const pedidos = await Pedido.find();
                return pedidos;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        obtenerPedidosUsuario:async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({vendedor: ctx.id}).populate("cliente");
                return pedidos;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        obtenerPedido:async (_, {id}, ctx) => {
            // verificar que el usuario es quien obtiene los clientes
            if(!ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }
            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }
            try {
                // verficiar si el pedido existe
                const pedido = await Pedido.findById(id);
                // verificar si el usuario es quien obtenga el pedido
                if (pedido.vendedor !== ctx.id) {
                    throw new Error('No tienen permisos para realizar esta operación');
                }
                return pedido;
            } catch (e) {
                console.log(e);
                return new Error('El Pedido seleccionado no existe');
            }
        },
        obtenerPedidosEstado: async (_, {estado}, ctx) => {
            // verificar que el usuario es quien obtiene los clientes
            if(!ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }
           
            try {
                const pedidos = Pedido.find({vendedor: ctx.id}).where('estado').equals(estado);
                return pedidos;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        mejoresClientes: async (_, {}, ctx) => {
            // documentacion: http://gpd.sip.ucm.es/rafa/docencia/nosql/Agregando.html
             // verificar que el usuario es quien obtiene los clientes
             if(!ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }
            try {
                const clientes = await Pedido.aggregate([
                    {$match: {estado: "COMPLETADO"}},
                    {$group: {
                        _id: "$cliente",
                        total: {$sum: '$total'}
                    }},
                    {
                        $lookup: {
                            from: 'clientes',
                            localField: "_id",
                            foreignField: "_id",
                            as: "cliente"
                        }
                    },
                    {$limit: 10},
                    {$sort : { total: -1 }}
                ]);
                return clientes;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        mejoresVendedores: async (_, {}, ctx) => {
             // verificar que el usuario es quien obtiene los clientes
             if(!ctx.id){
                throw new Error('No tienen permisos para realizar esta operación');
            }

            try {
                const vendedores = await Pedido.aggregate([
                    {$match: {estado: "COMPLETADO"}},
                    {$group: {
                        _id: "$vendedor",
                        total: {$sum: "$total"}
                    }},
                    {
                        $lookup: {
                            from: 'usuarios',
                            localField: "_id",
                            foreignField: "_id",
                            as: "vendedor"
                        }
                    },
                    {$limit: 5},
                    {$sort : { total: -1 }}
                ]);
                return vendedores;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        buscarProducto: async(_, {texto}, ctx) => {
            try {
                const productos = await Producto.find({$text: {$search: texto}}).limit(10);
                return productos;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input}) => {
            const {email, password} = input;
            // verificar si el correo del usuario existe
            const usuario = await Usuario.findOne({email});

            if (usuario) {
                throw new Error('El correo ya esta registrado');
            }

            try {
                // registrar el nuevo usuario
                const nuevoUsuario = new Usuario(input);
                // console.log(nuevoUsuario);

                // hashear el password del usuario
                const salt = bcrypt.genSaltSync(10);
                const passwordEmcrypted = bcrypt.hashSync(password, salt);
                // almacenar usuario en la base de datos
                nuevoUsuario.password = passwordEmcrypted;
                await nuevoUsuario.save();

                return nuevoUsuario;
            } catch (e) {
                console.log(e);
                return 'Error en el sevidor'
            }
        },
        autenticarUsuario: async (_, {input}) => {
            const {password, email} = input;
            // verificar si el usuario existe
            const usuario = await Usuario.findOne({email});

            if (!usuario) {
                throw new Error('El correo No esta registrado');
            }

            // verificar si el password es correcto
            const passwordExiste = bcrypt.compareSync(password, usuario.password);

            if (!passwordExiste) {
                throw new Error('El password es incorrecto');
            }
            // console.log(typeof usuario._id);
            return  {
                token: crearToken(usuario, process.env.SECRETA, '7d'), 
            }
        },
        nuevoProducto: async (_, {input}, ctx) => {
            const {nombre, existencia, precio} = input;
            // console.log(input);
            if (nombre.trim().length === 0 || Number(existencia) === 0 || precio === 0 ) {
                throw new UserInputError('Debe ingresar valores validos diferentes a 0 ó vacio');
              }
            const producto = new Producto(input);
            try {
                const resultado = await producto.save();
                // console.log(resultado);
                return resultado; 
            } catch (e) {
                console.log(e);
                if (e.message.startsWith('Database Error: ')) {
                    return new Error('Internal server error');
                }
            }
        },
        actualizarProducto: async (_, {id, input}, ctx) => {
            // verificar si el id de la orden es valido
            if(!isValidObjectId(id)){
                throw new UserInputError('El ID ingresado no es valido'); 
            } 
            // verificar si el producto existe
            const producto = await Producto.findById(id);
            if(!producto) {
                throw new UserInputError('El producto no existe');
            }

            try {
                const productoActualizado = await Producto.findOneAndUpdate({_id: id}, input, {new: true});
                return productoActualizado;
            } catch (e) {
                return new Error('Internal server error');
            }
        },
        eliminarProducto: async (_, {id}, ctx) => {
            // verificar si el id de la orden es valido
            if(!isValidObjectId(id)){
                throw new UserInputError('El ID ingresado no es valido'); 
            }
            // verificar si el producto existe
            const producto = await Producto.findById(id);
            if(!producto) {
                throw new UserInputError('El producto no existe');
            }
            try {
                await Producto.findByIdAndDelete(id);
                return 'El producto fue eliminado';
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        nuevoCliente: async (_, {input}, ctx) => {
            // console.log(ctx);
            const {email} = input;
            // verificar si el cliente ya esta registrado
            const cliente = await Cliente.findOne({email});
            if (cliente) {
                throw new Error('El correo ya esta registrado');
            }
            const nuevoCliente = new Cliente(input);
            // asignar el vendedor
            nuevoCliente.vendedor = ctx.id;
            // guardar en la  base de datos
            try {
                const clienteRegistrado = await nuevoCliente.save();
                return clienteRegistrado;
            } catch (e) {
                // console.log(e);
                return new Error('Internal server error');
            } 
        },
        actualizarCliente: async (_, {id, input}, ctx) => {
            // valida si se envia un objeto nulo
            if(Object.keys(input).length === 0) return;
            // const {email, telefono} = input;

            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }
            // // verificar si el correo ya esta registrado
            // if (email) {
            //     const cliente = await Cliente.findOne({email});
            //     if (cliente) {
            //         throw new Error('El correo ya esta registrado');
            //     }
            // }
            // if(telefono) {
            //     // verificar si el telefono ya esta registrado
            //     const cliente = await Cliente.findOne({telefono});
            //     if (cliente) {
            //         throw new Error('El teléfono ya esta registrado');
            //     }
            // }
            // verficicar si el vendedor es el que edita
            // verificar si el cliente existe
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('El cliente seleccionado no existe');
            }

            if (cliente.vendedor.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales');
            }

            try {
                const clienteActualizado = await Cliente.findByIdAndUpdate(id, input, {new: true});
                return clienteActualizado
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        eliminarCliente: async (_, {id}, ctx) => {
            // verificar si el id es valido
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }

            // verificar si el cliente existe
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('El cliente seleccionado no existe');
            }

            if (cliente.vendedor.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales');
            }

            try {
                await Cliente.findByIdAndDelete(id);
                return 'El cliente fue eliminado'
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        nuevoPedido: async (_, {input}, ctx) => {
            if(!ctx){
                throw new Error('No tiene permisos para realizar esta operación')
            }
            const {cliente} = input;
            let total = 0;
            // verificar si el id es valido
            if(!isValidObjectId(cliente)){
                throw new Error('El id ingresado no es valido');
            }
            // verificar si el cliente existe
            const clienteExiste = await Cliente.findById(cliente);
            if (!clienteExiste) {
                throw new Error('El cliente seleccionado no existe');
            }
            // verficar si el cliente es del vendedor
            if (clienteExiste.vendedor.toString() !== ctx.id) {
                throw new Error('No tienes las credenciales');
            }
            // Revizar que el stock este disponible
            for await (const articulo of input.pedido) {
                const {id, cantidad} = articulo;
                const producto = await Producto.findById(id);
                if (cantidad > producto.existencia) {
                    // total = 0;
                    throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                }
                total += producto.precio * cantidad;
                // articulo.
            }
            // restar la cantidad a lo disponible
            for await(const articulo of input.pedido) {
                const {id} = articulo;
                const producto = await Producto.findById(id);
                producto.existencia = producto.existencia - articulo.cantidad; 
                await producto.save();
            }

            input.total = total;
            // crear un nuevo pedido
            const nuevoPedido = new Pedido(input);
            // asignarle un vendedor
            nuevoPedido.vendedor = ctx.id;
            // guardar en la base de datos
            const resultado = await nuevoPedido.save();
            return resultado;
        },
        actualizarPedido: async (_, {id, clienteId, input}, ctx) => {
            // console.log(ctx);
            const {pedido: newPedido} = input;
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }
            if(!isValidObjectId(clienteId)){
                throw new Error('El id ingresado no es valido');
            }
            let total = 0;
            // verificar si el pedido existe
            const pedido = await Pedido.findById(id);
            // console.log(pedido);
            if (!pedido) {
                throw new Error('El pedido no existe');
            }
            // verificar si el cliente existe
            const cliente = await Cliente.findById(clienteId);
            // console.log(cliente);
            if (!cliente) {
                throw new Error('El cliente no existe');
            }

            // verificar si el cliente y pedidos pretenencen al vendedor
            if (ctx.id !== String(cliente.vendedor) || ctx.id !== String(pedido.vendedor)) {
                throw new Error('No tiene permiso para realizar este tipo de operación');
            }
            
            if(newPedido) {
                console.log('me ejecute :D');
                // Revizar que el stock este disponible
                for await (const articulo of input.pedido) {
                    const {id, cantidad} = articulo;
                    if (Math.sign(cantidad) === -1) {
                        throw new Error(`La cantidad No puede ser un numero negativo`);
                    }
                    const producto = await Producto.findById(id);
                    // verificar que la cantidad sea positiva
                    if (cantidad > producto.existencia) {
                        // total = 0;
                        throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                    }
                    const cantidadPrevia = pedido.pedido.find(item => item.id === id).cantidad;
                    producto.existencia = producto.existencia - (cantidadPrevia - cantidad);
                    total += producto.precio * cantidad;
                    await producto.save();
                    // articulo.
                }
                // restar la cantidad a lo disponible
                // for await(const articulo of input.pedido) {
                //     const {id, cantidad} = articulo;
                //     const producto = await Producto.findById(id);
                //     producto.existencia = producto.existencia - (pedido.cantidad - articulo.cantidad); 
                //     await producto.save();
                // }
                // actualizar  el total
                pedido.total = total;
            }
            
            try {
                const resultado = await Pedido.findByIdAndUpdate(pedido.id, input, {new: true});
                return resultado;
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
        eliminarPedido: async (_, {id}, ctx) => {
            if(!isValidObjectId(id)){
                throw new Error('El id ingresado no es valido');
            }
            // verificar si el pedido existe
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('El pedido no existe')
            }
            // verificar que el vendedor es quien elimina el pedido
            if (ctx.id !== String(pedido.vendedor)) {
                throw new Error('El pedido no existe')
            }

            for await (const articulo of pedido.pedido) {
                const {id, cantidad} = articulo;
                const producto = await Producto.findById(id);
                // console.log(producto);
                // const nuevoPedido = pedido.find(item => item.id !== id).cantidad;
                producto.existencia = producto.existencia + cantidad;
                await producto.save();
            }
            
            try {
                await Pedido.findByIdAndDelete(id);
                return 'El pedido Fue eliminado correctamente'
            } catch (e) {
                console.log(e);
                return new Error('Internal server error');
            }
        },
    }
}
// funcion para generar el token de validacion
const crearToken = (usuario, secreta, expiresIn) => {
    const {email, nombre, id} = usuario;
    const token = jwt.sign({id, nombre, email}, secreta, {expiresIn});
    return token;
}

export default resolvers;