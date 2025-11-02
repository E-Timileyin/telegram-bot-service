import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { startCommand } from './commands/start.js';
import { latestCommand } from './commands/latest.js';
import { uploadCommand } from './commands/upload.js';
import { makeAdminCommand } from './commands/makeadmin.js';
import { archiveCommand } from './commands/archive.js';
import { helpCommand } from './commands/help.js';
import { sermonCommand } from './commands/addsermon.js';
import { ensureAdminUser } from '../utils/ensureAdmin.js';
import ServiceMedia from '../models/ServiceMedia.Model.js';

export const bot = new Telegraf(config.botToken);

export const initBot = async (): Promise<void> => {
  try {
    // Ensure admin user exists
    await ensureAdminUser();
    
    // Register commands
    startCommand(bot);
    latestCommand(bot);
    uploadCommand(bot);
    makeAdminCommand(bot);
    archiveCommand(bot);
    helpCommand(bot);
    sermonCommand(bot);

    // Set up bot commands menu
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'latest', description: 'View latest Sunday media' },
      { command: 'sermon', description: 'Take sermon notes (Admin)' },
      { command: 'archive', description: 'Browse past services' },
      { command: 'help', description: 'Show help information' },
    ]);

    // Set up callback query handlers
    bot.action('latest', async (ctx) => {
      try {
        await ctx.answerCbQuery();
        // Use the command directly
        await ctx.reply('Fetching latest Sunday media...');
        const latestMedia = await ServiceMedia.findOne({ eventType: "CurrentSunday" })
          .sort({ date: -1 })
          .exec();

        if (latestMedia && latestMedia.mediaUrls.length > 0) {
          if (latestMedia.sermonNotes) {
            await ctx.reply(`📝 *Sermon Notes - ${latestMedia.date}*\n\n${latestMedia.sermonNotes}`, { parse_mode: 'Markdown' });
          }
          const mediaGroup = latestMedia.mediaUrls.map(url => ({ type: "photo" as const, media: url }));
          await ctx.replyWithMediaGroup(mediaGroup);
        } else {
          await ctx.reply("No media found for the latest Sunday.");
        }
      } catch (error) {
        console.error('Error handling latest action:', error);
        await ctx.reply('An error occurred. Please try again.');
      }
    });

    bot.action('sermon', async (ctx) => {
      try {
        await ctx.answerCbQuery();
        await ctx.reply('Please use /sermon to start taking sermon notes.');
      } catch (error) {
        console.error('Error handling sermon action:', error);
      }
    });

    bot.action('archive', async (ctx) => {
      try {
        await ctx.answerCbQuery();
        await ctx.reply('Fetching archive...');
        // Get the last 5 Sunday services
        const archives = await ServiceMedia.find({ eventType: "CurrentSunday" })
          .sort({ date: -1 })
          .limit(5);

        if (archives.length > 0) {
          const archiveList = archives.map((item, index) => 
            `${index + 1}. ${item.date} - ${item.mediaUrls.length} media items`
          ).join('\n');
          
          await ctx.reply(`📚 *Archive*\n\n${archiveList}`, { parse_mode: 'Markdown' });
        } else {
          await ctx.reply("No archived media found.");
        }
      } catch (error) {
        console.error('Error handling archive action:', error);
        await ctx.reply('An error occurred while accessing the archive.');
      }
    });

    bot.action('help', async (ctx) => {
      try {
        await ctx.answerCbQuery();
        const helpMessage = `Here are the available commands:\n\n` +
          `/start - Show welcome message and main menu\n` +
          `/latest - View the most recent Sunday images\n` +
          `/sermon - Take sermon notes (Admin only)\n` +
          `/archive - Browse past services\n` +
          `/help - Show this help message`;
        
        await ctx.reply(helpMessage);
      } catch (error) {
        console.error('Error handling help action:', error);
        await ctx.reply('An error occurred while fetching help.');
      }
    });

    // Start bot
    await bot.launch({
      dropPendingUpdates: true,
      allowedUpdates: ['message', 'callback_query']
    });
    console.log(' Bot is running!');
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    throw error;
  }
};

// Handle bot errors
bot.catch((err: any, ctx: any) => {
  console.error('Bot error:', err);
  ctx?.reply('An error occurred. Please try again later.');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
