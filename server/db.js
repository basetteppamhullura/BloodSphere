import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodsphere';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected to MongoDB database successfully.');
  } catch (err) {
    console.warn(`[MongoDB] Warning: Could not connect to local MongoDB (${err.message}). Using in-memory database store mode for local demo.`);
  }
}
