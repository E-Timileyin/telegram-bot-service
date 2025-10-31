import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { startCommand } from './commands/start.js';
import { photoCommand } from './commands/photo.js';

export const bot = new Telegraf(config.botToken);

// Setup middlewares & commands
photoCommand(bot);
startCommand(bot);

export const initBot = async (): Promise<void> => {
  await bot.launch();
  console.log('🤖 Telegram Bot Started');
};
