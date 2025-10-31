import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { startCommand } from './commands/start.js';
import { latestCommand } from './commands/latest.js';
import { uploadCommand } from './commands/upload.js';
import { makeAdminCommand } from './commands/makeadmin.js';
import { archiveCommand } from './commands/archive.js';

export const bot = new Telegraf(config.botToken);

// Setup middlewares & commands
latestCommand(bot);
uploadCommand(bot);
startCommand(bot);
makeAdminCommand(bot);
archiveCommand(bot);

export const initBot = async (): Promise<void> => {
  // Set persistent menu button
  await bot.telegram.setMyCommands([
    { command: 'latest', description: 'View latest Sunday images' },
    { command: 'archive', description: 'View past images' },
    { command: 'upload', description: 'Upload media (Admin only)' },
    { command: 'help', description: 'Get help' }
  ]);

  await bot.launch();
  console.log('Running Telegram Bot');
};
