import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initBot } from './bot/bot.js';

const PORT = config.port || 3000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Launch Telegram bot
    await initBot();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
