import { server } from "./app.js";
import { connectDB } from "./config/db.js";
import { initBot } from "./bot/bot.js";

const startServer = async () => {
  try {
    console.log("Starting server initialization...");

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected successfully.");

    // Launch Telegram bot
    console.log("Launching Telegram bot...");
    await initBot();
    console.log("Bot launched successfully.");

    // Server is already started in app.ts, just log the URL
    const address = server.address();
    const port = typeof address === 'string' ? address : address?.port;
    console.log(`Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
