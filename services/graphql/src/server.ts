import "dotenv/config";

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { schema } from './modules/schema';
import { createContext, prisma } from './modules/context';
import { authMiddleware } from "./middlewares/auth";

const PORT =  8080;

async function startServer() {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
    });

    await server.start();

     // Check database connection
     try {
        console.log('🔍 Checking database connection...');
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }

    // health check route 
    app.use('/api/health', (req, res) => {
        res.status(200).json({ message: 'OK' ,service:'graphql', time: new Date().toISOString()});
    });

    // graphql route 
    app.use('/api/graphql', 
        cors({
            origin:  ["http://localhost:3000"], 
            credentials: true, // Allow cookies
        }),
        cookieParser(), // Parse cookies
        bodyParser.json(),
        authMiddleware, //middleware
        expressMiddleware(server, {
            context: async ({ req, res }) => createContext({ req, res })
        })
    );

    
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/api/graphql`);
}

startServer().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
});