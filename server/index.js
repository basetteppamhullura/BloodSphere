import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { initSocketHandler } from './socketHandler.js';
import { createAdminRouter } from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize HTTP & Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize socket handler
const socketHandler = initSocketHandler(io);

// Mount Admin API router
app.use('/api', createAdminRouter(socketHandler));

app.get('/health', (req, res) => {
  res.json({ status: 'ONLINE', timestamp: new Date().toISOString() });
});

// Connect DB & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[BloodNet Server] Live Express + Socket.IO server listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('[BloodNet Server] Database connection error:', err);
  server.listen(PORT, () => {
    console.log(`[BloodNet Server] Running in fallback mode on http://localhost:${PORT}`);
  });
});
