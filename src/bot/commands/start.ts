import { Telegraf } from 'telegraf';
import ServiceMedia from "../../models/ServiceMedia.Model.js";

export const startCommand = (bot: Telegraf) => {
  bot.start(async (ctx) => {
    const welcomeMessage = `Welcome to STS_TIC Media Bot.

I'm designed to assist church members in accessing and managing service media efficiently:

• View the latest Sunday service images.
• Retrieve images from previous Sundays for reference.
• Admins can securely upload new media for the congregation.

Commands you can use:

/latest - View the most recent Sunday images
/upload - (Admin only) Upload new media
/history - Access images from a specific Sunday

Our goal is to ensure all members can easily access church service media anytime, keeping the community connected and informed.

Click the buttons below to get started:`;
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Current Media', callback_data: 'latest' }
          ],
          [
            { text: 'View Past Media', callback_data: 'archive' }
          ]
        ]
      }
    });
    
    // Show latest media if available
    const latestMedia = await ServiceMedia.findOne({ eventType: "CurrentSunday" }).sort({ date: -1 });
    if (latestMedia) {
      // Display sermon notes if available
      if (latestMedia.sermonNotes) {
        await ctx.reply(`*Latest Sermon Notes - ${latestMedia.date}*\n\n${latestMedia.sermonNotes}`, { parse_mode: 'Markdown' });
      }
      
      await ctx.reply("Here are the latest Sunday images:");
      const mediaGroup = latestMedia.mediaUrls.map(url => ({ type: "photo" as const, media: url }));
      ctx.replyWithMediaGroup(mediaGroup);
    }
  });
};
