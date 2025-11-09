import { Telegraf, Context, Markup } from "telegraf";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

const MEDIA_TYPES = {
  IMAGE: 'image',
  SERMON: 'sermon',
  SERMON_DATE: 'sermon_date_'
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

  // Handle sermon date selection
  bot.action(/^sermon_date_(\d{4}-\d{2}-\d{2})$/, async (ctx: any) => {
    try {
      const date = ctx.match[1];
      await ctx.answerCbQuery();
      
      const sermon = await ServiceMedia.findOne({
        eventType: "CurrentSunday",
        date: date,
        $or: [
          { 
            mediaType: { $in: ["sermon", "text"] },
            $or: [
              { sermonNotes: { $exists: true, $ne: "" } },
              { description: { $exists: true, $ne: "" } }
            ]
          }
        ]
      });

      if (!sermon) {
        return await ctx.reply(`No sermon notes found for ${date}.`);
      }

      await ctx.reply(
        `📝 *Sermon Notes - ${sermon.date}*\n\n${sermon.sermonNotes}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error("Error fetching sermon by date:", err);
      await ctx.reply("An error occurred while fetching the sermon. Please try again later.");
    }
  });

  // Handle callback queries for the latest options
  bot.action(new RegExp(`^latest_(${Object.values(MEDIA_TYPES).filter(t => t !== 'sermon_date_').join('|')})$`), async (ctx: any) => {
    try {
      const mediaType = ctx.match[1];
      await ctx.answerCbQuery();
      
      if (mediaType === MEDIA_TYPES.SERMON) {
        // Get available sermon dates for selection
        const sermonDates = await ServiceMedia.find({
          eventType: "CurrentSunday",
          $or: [
            { 
              mediaType: { $in: ["sermon", "text"] },
              $or: [
                { sermonNotes: { $exists: true, $ne: "" } },
                { description: { $exists: true, $ne: "" } }
              ]
            }
          ]
        })
          .sort({ date: -1 })
          .limit(10) // Limit to 10 most recent sermons
          .select('date')
          .exec();

        if (sermonDates.length === 0) {
          return await ctx.reply("No sermon notes available.");
        }

        // Create buttons for each date
        const buttons = sermonDates.map(sermon => [
          Markup.button.callback(
            `📅 ${sermon.date}`,
            `${MEDIA_TYPES.SERMON_DATE}${sermon.date}`
          )
        ]);

        return await ctx.reply(
          '📖 Select a date to view sermon notes:',
          Markup.inlineKeyboard(buttons)
        );
      }

      // For images, find the latest media with images
      const latestMedia = await ServiceMedia.findOne({
        eventType: "CurrentSunday",
        mediaType: { $in: ["photo", "image"] },
        mediaUrls: { $exists: true, $not: { $size: 0 } }
      }).sort({ date: -1 }).exec();

      if (!latestMedia || !latestMedia.mediaUrls?.length) {
        return await ctx.reply("No media found for the latest Sunday.");
      }

      // Handle image media
      const mediaGroup = latestMedia.mediaUrls.map(url => ({
        type: "photo" as const,
        media: url
      }));
      await ctx.replyWithMediaGroup(mediaGroup);
    } catch (err) {
      console.error("Error handling latest media request:", err);
      await ctx.reply("An error occurred while fetching the media. Please try again later.");
    }
  });
};
