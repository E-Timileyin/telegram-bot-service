import { Telegraf, Context } from "telegraf";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

export const archiveCommand = (bot: Telegraf) => {
  // List all available dates
  bot.action("archive", async (ctx: Context) => {
    try {
      const dates = await ServiceMedia.find({ eventType: "CurrentSunday" })
        .distinct("date")
        .sort({ date: -1 });

      if (dates.length === 0) {
        return ctx.reply("No archived images found.");
      }

      // Create buttons for each date
      const buttons = dates.slice(0, 10).map((date) => [
        { text: `${date}`, callback_data: `view_date_${date}` }
      ]);

      await ctx.editMessageText("Select a date to view images:", {
        reply_markup: {
          inline_keyboard: buttons
        }
      });
    } catch (err) {
      console.error("Archive error:", err);
      ctx.reply("Error fetching archived images.");
    }
  });

  // View images for a specific date
  bot.action(/view_date_(.+)/, async (ctx: Context) => {
    try {
      const date = (ctx as any).match?.[1];

      const media = await ServiceMedia.findOne({
        eventType: "CurrentSunday",
        date: date
      });

      if (!media || media.mediaUrls.length === 0) {
        return ctx.reply(`No images found for ${date}.`);
      }

      await ctx.reply(`Images from ${date}:`);
      const mediaGroup = media.mediaUrls.map(url => ({
        type: "photo" as const,
        media: url
      }));
      ctx.replyWithMediaGroup(mediaGroup);
    } catch (err) {
      console.error("View date error:", err);
      ctx.reply("Error fetching images for this date.");
    }
  });
};
