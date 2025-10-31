import { Telegraf, Context } from "telegraf";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

export const latestCommand = (bot: Telegraf) => {
  bot.command("latest", async (ctx: Context) => {
    try {
      const latestMedia = await ServiceMedia.findOne({ eventType: "CurrentSunday" })
        .sort({ date: -1 })
        .exec();

      if (latestMedia && latestMedia.mediaUrls.length > 0) {
        const mediaGroup = latestMedia.mediaUrls.map(url => ({ type: "photo" as const, media: url }));
        await ctx.replyWithMediaGroup(mediaGroup);
      } else {
        await ctx.reply("No media found for the latest Sunday.");
      }
    } catch (err) {
      console.error("Error fetching latest media:", err);
      await ctx.reply("Error fetching media. Please try again later.");
    }
  });
};
