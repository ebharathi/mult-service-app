import "dotenv/config";

import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import apiRoutes from './routes/route';
import { prisma } from "./prisma";

const PORT = 8081;

async function startServer() {
    const app = express();
    const httpServer = http.createServer(app);

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
        res.status(200).json({ message: 'OK', service:'gen ai', time: new Date().toISOString() });
    });

    // REST API v1 routes
    app.use('/api/v1',
        cors({
            origin: ["http://localhost:3000"],
            credentials: true, // Allow cookies
        }),
        cookieParser(), // Parse cookies
        bodyParser.json(),
        apiRoutes
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 GEN AI Server ready at http://localhost:${PORT}/api/v1`);
}

startServer().catch((error) => {
    console.error('Error starting chat server:', error);
    process.exit(1);
});
