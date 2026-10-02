import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodsphere';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false);
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected to MongoDB database successfully.');
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Warning: Could not connect to local MongoDB (${err.message}). Using in-memory database store mode for local demo.`);
  }
}

export function isDBConnected() {
  return isConnected;
}
