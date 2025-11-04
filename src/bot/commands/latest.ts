import { Telegraf, Context, Markup } from "telegraf";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

const MEDIA_TYPES = {
  IMAGE: 'image',
  SERMON: 'sermon'
} as const;

export const latestCommand = (bot: Telegraf) => {
  // Handle the /latest command
  bot.command("latest", async (ctx: Context) => {
    try {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📸 Latest Image', `latest_${MEDIA_TYPES.IMAGE}`)],
        [Markup.button.callback('📖 Latest Sermon', `latest_${MEDIA_TYPES.SERMON}`)]
      ]);
      
      await ctx.reply('What would you like to see?', keyboard);
    } catch (err) {
      console.error("Error in latest command:", err);
      await ctx.reply("An error occurred. Please try again later.");
    }
  });

  // Handle callback queries for the latest options
  bot.action(new RegExp(`^latest_(${Object.values(MEDIA_TYPES).join('|')})$`), async (ctx: any) => {
    try {
      const mediaType = ctx.match[1];
      await ctx.answerCbQuery();
      
      const latestMedia = await ServiceMedia.findOne({ eventType: "CurrentSunday" })
        .sort({ date: -1 })
        .exec();

      if (!latestMedia || latestMedia.mediaUrls.length === 0) {
        await ctx.reply("No media found for the latest Sunday.");
        return;
      }

      if (mediaType === MEDIA_TYPES.IMAGE) {
        // Send all media files as a group
        const mediaGroup = latestMedia.mediaUrls.map(url => ({ 
          type: "photo" as const, 
          media: url 
        }));
        await ctx.replyWithMediaGroup(mediaGroup);
      } else if (mediaType === MEDIA_TYPES.SERMON && latestMedia.sermonNotes) {
        // Send sermon notes if available
        await ctx.reply(
          `📝 *Sermon Notes - ${latestMedia.date}*\n\n${latestMedia.sermonNotes}`, 
          { parse_mode: 'Markdown' }
        );
      } else {
        await ctx.reply("No sermon notes available for the latest Sunday.");
      }
    } catch (err) {
      console.error("Error handling latest media request:", err);
      await ctx.reply("An error occurred while fetching the media. Please try again later.");
    }
  });
};
