import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { initSocketHandler } from './socketHandler.js';
import { createAdminRouter } from './routes/adminRoutes.js';
import { createBloodBankRouter } from './routes/bloodBankRoutes.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));

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

// Document Upload Route (Prescriptions & Medical Records)
app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileData } = req.body || {};
    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, message: 'Missing file data or file name.' });
    }

    const cleanBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    const sanitizedName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadsDir, sanitizedName);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${sanitizedName}`;
    console.log(`[File Storage] Saved document to ${filePath}`);

    res.json({
      success: true,
      fileUrl,
      fileName,
      storedName: sanitizedName
    });
  } catch (err) {
    console.error('[Upload API Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Admin & Blood Bank API routers
app.use('/api', createAdminRouter(socketHandler));
app.use('/api/bloodbank', createBloodBankRouter(socketHandler));

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
