import { Telegraf, Context } from "telegraf";
import axios from "axios";
import { Readable } from "stream";
import mongoose from "mongoose";

import User from "../../models/User.Model.js";
import ServiceMedia from "../../models/ServiceMedia.Model.js";
import cloudinary from "../../config/cloudinary.js";

/**
 * UploadCommand
 * Admins can upload photos with caption /upload.
 */
export const uploadCommand = (bot: Telegraf) => {
  bot.on("photo", async (ctx: Context) => {
    // Only handle messages with caption "/upload"
    if ((ctx.message as any).caption !== "/upload") return;

    try {
      console.log("🟢 Upload command triggered");

      // 1️⃣ Ensure MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        console.error("❌ MongoDB not connected");
        return ctx.reply("Database not connected. Try again later.");
      }

      // 2️⃣ Identify user
      const telegramId = ctx.from?.id?.toString();
      if (!telegramId) return ctx.reply("Cannot identify user.");

      const user = await User.findOne({ telegramId });
      if (!user || user.role !== "admin") {
        console.log("⛔ Unauthorized user:", telegramId);
        return ctx.reply("Only admins can upload media.");
      }

      // 3️⃣ Extract photos
      const photos = (ctx.message as any)?.photo;
      if (!photos?.length) {
        console.warn("⚠️ No photos found in message");
        return ctx.reply("Please attach one or more photos with caption /upload.");
      }

      console.log(`📸 Received ${photos.length} photo(s)`);

      const uploadedUrls: string[] = [];

      // 4️⃣ Upload largest size per photo
      const largestPhoto = photos[photos.length - 1]; // last = largest
      try {
        const file = await ctx.telegram.getFile(largestPhoto.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        console.log("🌐 Telegram file URL:", fileUrl);

        // Download photo as buffer
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data);
        console.log("📦 Photo downloaded, size:", buffer.length);

        // Convert to base64 for Cloudinary
        const base64String = `data:image/jpeg;base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64String, {
          folder: "church_sunday",
        });

        console.log("✅ Uploaded to Cloudinary:", uploadResult.secure_url);
        uploadedUrls.push(uploadResult.secure_url);
      } catch (cloudErr) {
        console.error("❌ Cloudinary upload error:", cloudErr);
        return ctx.reply("Failed to upload image to Cloudinary. Check logs.");
      }

      // 5️⃣ Save metadata to MongoDB
      try {
        const media = new ServiceMedia({
          uploader: user._id,
          eventType: "sunday",
          date: new Date().toISOString().split("T")[0],
          mediaUrls: uploadedUrls,
          mediaType: "photo",
        });

        await media.save();
        console.log("💾 Media metadata saved to MongoDB");
      } catch (dbErr) {
        console.error("❌ MongoDB save error:", dbErr);
        return ctx.reply("Image uploaded but failed to save metadata.");
      }

      // 6️⃣ Confirm success
      ctx.reply(`✅ Uploaded ${uploadedUrls.length} image(s) successfully!`);
    } catch (err: any) {
      console.error("❌ Upload command error:", err.message || err);
      ctx.reply("Sorry, an unexpected error occurred. Please try again later.");
    }
  });
};
