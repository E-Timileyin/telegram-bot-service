import dotenv from 'dotenv';

// load .env file
dotenv.config({ path: '.env.local' });

export const config = {
  port: process.env.PORT || 5000,
  botToken: process.env.BOT_TOKEN!,
  mongoURI: process.env.MONGO_URI!,
  ownerId: process.env.OWNER_ID!,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
} as const;
