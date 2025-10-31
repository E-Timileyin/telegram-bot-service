import express from 'express';
import type { Application } from 'express';
import { json, urlencoded } from 'express';
import mongoose from 'mongoose';

const app: Application = express();
app.use(json());
app.use(urlencoded({ extended: true }));

// API Routes
app.use('/api/test', (req, res) => {
    res.json({ message: 'Testing API' });
});

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const status = {
        database: dbStatus === 1 ? 'connected' : 'disconnected',
        dbState: dbStatus, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        uptime: process.uptime()
    };
    res.json(status);
});

export default app;
