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
/sermon - (Admin only) Take sermon notes
/history - Access images from a specific Sunday

Our goal is to ensure all members can easily access church service media anytime, keeping the community connected and informed.

Click the buttons below to get started:`;
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Current Media', callback_data: 'latest' },
            { text: 'Sermon Notes', callback_data: 'sermon' },
            { text: 'View Past Media', callback_data: 'archive' },
            { text: 'Help', callback_data: 'help' }
          ]
        ]
      }
    });
    
    // Inform user they can view latest media
    const latestMedia = await ServiceMedia.findOne({ eventType: "CurrentSunday" }).sort({ date: -1 });
    if (latestMedia) {
      // Only show a message about available media
      await ctx.reply("You can view the latest Sunday media by using the /latest command.");
    } else {
      await ctx.reply("No Sunday media is currently available. Check back later!");
    }
  });
};
