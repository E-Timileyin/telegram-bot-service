import { Telegraf } from 'telegraf';

export const startCommand = (bot: Telegraf) => {
  bot.start((ctx) => {
    ctx.reply('👋 Welcome to Church Media Bot! Use /photos to view recent Sunday images.');
  });
};
