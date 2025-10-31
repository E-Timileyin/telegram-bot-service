import { Telegraf, Context } from "telegraf";
import User from "../../models/User.Model.js";
import ServiceMedia from "../../models/ServiceMedia.Model.js";
import cloudinary from "../../config/cloudinary.js";

export const uploadCommand = (bot: Telegraf) => {
  bot.command("upload", async (ctx: Context) => {
    try {
      const telegramId = ctx.from?.id?.toString();
      if (!telegramId) return ctx.reply("Cannot identify user.");

      // Check user role
      const user = await User.findOne({ telegramId });
      if (!user || user.role !== "admin") {
        return ctx.reply("Only admins can upload media.");
      }

      // Check if media is attached
      const photos = (ctx.message as any)?.photo;
      if (!photos || photos.length === 0) {
        return ctx.reply("Send images along with the /upload command.");
      }

      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        const fileUrl = await ctx.telegram.getFileLink(photo.file_id);
        const upload = await cloudinary.uploader.upload(fileUrl.href, {
          folder: "church_sunday",
        });
        uploadedUrls.push(upload.secure_url);
      }

      // Save to MongoDB
      const media = new ServiceMedia({
        uploader: user._id,
        eventType: "CurrentSunday",
        date: new Date().toISOString().split("T")[0],
        mediaUrls: uploadedUrls,
        mediaType: "photo",
      });

      await media.save();

      ctx.reply("Sunday images uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      ctx.reply("Error uploading media. Try again.");
    }
  });
};
