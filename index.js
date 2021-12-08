require('dotenv').config();
require('colors');
import express from 'express'
import logger from 'morgan'
import http from 'http'
import {ApolloServer} from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './db/resolvers';
import typeDefs from './db/schema';
import conectarDB from './config/db';
import jwt from 'jsonwebtoken';

const PORT = 4000;

!async function() {
    const app = express();
    
    conectarDB();

    app.use(logger('dev'));

    const httpServer = http.createServer(app);

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });

    const server = new ApolloServer({
        schema,
        context: ({req}) => {
            const token = req.headers['authorization'] || '';
            if (token) {
                try {
                    const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                    // console.log(usuario);
                    return usuario;
                } catch (e) {
                    console.log(e);
                    throw new Error('Token no valido')
                }
            }
        }
    });

    await server.start();
    server.applyMiddleware({app});

    const subscriptionServer = SubscriptionServer.create({
        schema,
        execute,
        subscribe,
    }, {
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
        // This `server` is the instance returned from `new ApolloServer`.
        path: server.graphqlPath,
    });
    
    ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => subscriptionServer.close());
    });

    httpServer.listen(PORT, () => {
        console.log(`Server is now running on http://localhost:${PORT}/graphql`.cyan);
    });
}()