import { Telegraf, Context } from "telegraf";
import User from "../../models/User.Model.js";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

// Temporary in-memory storage for active sermon drafts
const Sermon = new Map<string, string>();

export const sermonCommand = (bot: Telegraf) => {
  // View or create sermon notes
  bot.command("sermon", async (ctx: Context) => {
    try {
      const telegramId = ctx.from?.id?.toString();
      if (!telegramId) return ctx.reply("Cannot identify user.");

      const user = await User.findOne({ telegramId });
      if (!user) return ctx.reply("User not found. Please try again.");

      // Check if user is trying to create a new sermon note
      const args = (ctx.message as any)?.text?.split(' ');
      if (args && args[1]?.toLowerCase() === 'new') {
        if (user.role !== 'admin') {
          return ctx.reply("❌ Only admins can create new sermon notes.");
        }
        
        sermonDrafts.set(telegramId, "");
        return ctx.reply(
          "📝 You're creating a **new sermon note**.\n\n" +
          "• Type your sermon text and press send to save it immediately.\n" +
          "• To cancel, type /cancel\n\n" +
          "_Enter your sermon note now..._"
        );
      }

      // Show latest sermon notes to all users
      const latestSermon = await ServiceMedia.findOne({ eventType: "sermon" })
        .sort({ createdAt: -1 });

      if (latestSermon?.sermonNotes) {
        await ctx.reply(
          `📖 *Latest Sermon Notes* - ${latestSermon.date || 'No date'}\n\n` +
          `${latestSermon.sermonNotes}\n\n` +
          `_To create a new sermon note, use_ /sermon new _(Admin only)_`,
          { parse_mode: 'Markdown' }
        );
      } else {
        await ctx.reply(
          "No sermon notes available yet.\n\n" +
          "Admins can create a new sermon note with /sermon new"
        );
      }
    } catch (err) {
      console.error("❌ Sermon command error:", err);
      ctx.reply("Failed to process sermon command. Please try again.");
    }
  });

  // Handle text input for sermon notes
  bot.on("text", async (ctx: Context) => {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const text = (ctx.message as any).text;
    
    // Skip if it's a command
    if (text.startsWith('/')) return;

    // Check if user is in sermon creation mode
    if (sermonDrafts.has(telegramId)) {
      const user = await User.findOne({ telegramId });
      if (!user || user.role !== 'admin') {
        sermonDrafts.delete(telegramId);
        return ctx.reply("You don't have permission to save sermon notes.");
      }

      const sermonText = text.trim();
      if (!sermonText) {
        return ctx.reply("Please enter a valid sermon note.");
      }

      try {
        const sermon = new ServiceMedia({
          uploader: user._id,
          mediaType: "text",
          sermonNotes: sermonText,
          mediaUrls: [],
          eventType: "CurrentSunday",
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          captions: sermonText.substring(0, 200) + (sermonText.length > 200 ? '...' : '')
        });

        await sermon.save();
        sermonDrafts.delete(telegramId);

        await ctx.reply(
          `✅ Sermon note saved successfully!\n\n📝 Preview:\n${sermonText.substring(0, 500)}${sermonText.length > 500 ? '...' : ''}`,
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error("❌ Error saving sermon:", err);
        await ctx.reply("Failed to save sermon. Please try again.");
      }
    }
  });
};
