import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import { initBot } from "./bot/bot.js";

const PORT = config.port || 3000;

const startServer = async () => {
  try {
    console.log(" Starting server initialization...");

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Connection Successfully.");

    // Launch Telegram bot
    console.log("Launching Telegram bot...");
    await initBot();
    console.log("Bot launched successfully.");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
