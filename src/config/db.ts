import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB Connected Successfully Using db.ts file');
  } catch (error) {
    console.error('Failed to connect to db Using db.ts file:', error);
    process.exit(1);
  }
};
