import {gql} from 'apollo-server-express';

const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    type Producto {
        id: ID
        nombre: String
        existencia: Int
        precio: Float
        creado: String
    }

    type Vendedor {
        _id: ID
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    type Cliente {
        id: ID
         _id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: Cliente
        vendedor: ID
        creado: String
        estado: EstadoPedido
    }

    type PedidoGrupo {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    type Token {
        token: String
    }

    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type TopVendedor {
        total: Float
        vendedor: [Vendedor]
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }
    
    input UpdateProductoInput {
        nombre: String
        existencia: Int
        precio: Float
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String!
    }

    input ClientUpdateInput {
        nombre: String
        apellido: String
        email: String
        empresa: String
        telefono: String
    }

    input PedidoProductoInput {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        cliente: ID
        estado: EstadoPedido
    }

    input PedidoActualizarInput {
        pedido: [PedidoProductoInput]
        estado: EstadoPedido
    }

    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    type Query {
        #usuarios
        obtenerUsuario: Usuario
        
        #productos
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto
        
        #clientes
        obtenerClientes: [Cliente]
        obtenerClientesUsuario(id: ID!): [Cliente]
        obtenerCliente(id: ID!): Cliente

        #pedidos
        obtenerPedidos: [Pedido]
        obtenerPedidosUsuario: [Pedido]
        obtenerPedido(id: ID!): Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]

        #Busquedas avanzadas
        mejoresClientes: [TopCliente]
        mejoresVendedores: [TopVendedor]
        buscarProducto(texto: String!): [Producto]
    }

    type Mutation {
        #Usuarios
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token
        
        #Productos
        nuevoProducto(input: ProductoInput): Producto
        actualizarProducto(id: ID!, input: UpdateProductoInput): Producto
        eliminarProducto(id: ID!): String

        #clientes
        nuevoCliente(input: ClienteInput): Cliente
        actualizarCliente(id: ID!, input: ClientUpdateInput): Cliente
        eliminarCliente(id: ID!): String
        
        #Pedidos
        nuevoPedido(input: PedidoInput): Pedido
        actualizarPedido(id: ID!, clienteId: ID!, input: PedidoActualizarInput): Pedido
        eliminarPedido(id: ID!): String
    }
`;


export default typeDefs;