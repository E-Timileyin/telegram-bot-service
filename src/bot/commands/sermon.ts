import { Telegraf, Context } from "telegraf";
import User from "../../models/User.Model.js";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

// Temporary in-memory storage for active sermon drafts
const sermonDrafts = new Map<string, string>();

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
          "• Type your sermon text below.\n" +
          "• You can add multiple messages; they will be combined.\n" +
          "• When finished, type /sermon_done to save.\n\n" +
          "To cancel, type /cancel"
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

  // Collect text messages for sermon note
  bot.on("text", async (ctx: Context) => {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId || !sermonDrafts.has(telegramId)) return;

    const text = (ctx.message as any).text;
    if (text === "/sermon_done") return;

    const currentText = sermonDrafts.get(telegramId)!;
    sermonDrafts.set(telegramId, currentText + (currentText ? "\n\n" : "") + text);

    await ctx.reply(
      "📝 Text added to sermon note. Continue typing, or type /sermon_done to save."
    );
  });

  // Finish and save sermon note
  bot.command("sermon_done", async (ctx: Context) => {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId || !sermonDrafts.has(telegramId)) {
      return ctx.reply("No active sermon note. Start one with /sermon.");
    }

    const user = await User.findOne({ telegramId });
    if (!user || user.role !== 'admin') {
      sermonDrafts.delete(telegramId);
      return ctx.reply("You don't have permission to save sermon notes.");
    }

    const sermonText = sermonDrafts.get(telegramId)!;

    try {
      const sermon = new ServiceMedia({
        uploader: user._id,
        mediaType: "sermon",
        description: sermonText || "No text provided",
        mediaUrls: [],
        eventType: "sermon",
        date: new Date().toISOString().split("T")[0],
      });

      await sermon.save();
      sermonDrafts.delete(telegramId);

      await ctx.reply(
        `✅ Text-based sermon note saved successfully!\n\n📝 Preview:\n${sermonText.substring(
          0,
          500
        )}${sermonText.length > 500 ? "..." : ""}`
      );
    } catch (err) {
      console.error("❌ Error saving sermon:", err);
      await ctx.reply("Failed to save sermon. Try again.");
    }
  });
};
