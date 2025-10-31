import { Telegraf } from 'telegraf';
// import { Photo } from '../../modules/photo/photo.model';

export const photoCommand = (bot: Telegraf) => {
  bot.command('photos', async (ctx) => {
    // const photos = await Photo.find().sort({ createdAt: -1 }).limit(5);
    // if (!photos.length) return ctx.reply('No photos uploaded yet.');
    // for (const photo of photos) {
    //   await ctx.replyWithPhoto(photo.url);
    // }
  });
};
