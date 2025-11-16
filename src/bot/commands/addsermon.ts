import { Telegraf, Context, Markup } from "telegraf";
import mongoose from 'mongoose';
import User from "../../models/User.Model.js";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

// Temporary storage for active sermon drafts and their message IDs
const sermonDrafts = new Map<string, { text: string; messageId?: number }>();

export const addSermonCommand = (bot: Telegraf) => {
  // === Start a new sermon note ===
  bot.command("addsermon", async (ctx: Context) => {
    try {
      const telegramId = ctx.from?.id?.toString();
      if (!telegramId) return ctx.reply("Cannot identify user.");

      const user = await User.findOne({ telegramId });
      if (!user || user.role !== 'admin') {
        return ctx.reply("You don't have permission to create sermon notes.");
      }

      // Initialize or reset the sermon draft
      sermonDrafts.set(telegramId, { text: "" });

      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("➕ Add Text", "add_sermon_text"),
        Markup.button.callback("✅ Finish", "finish_sermon")
      ]);

      const message = await ctx.reply(
        "📝 *Sermon Note Editor*\n\n" +
        "Use the buttons below to add text or finish your sermon.\n\n" +
        "*Current content:* \nNo text added yet.",
        { 
          parse_mode: 'Markdown',
          ...keyboard 
        }
      );

      // Store the message ID for future updates
      if (message) {
        const draft = sermonDrafts.get(telegramId);
        if (draft) {
          draft.messageId = message.message_id;
          sermonDrafts.set(telegramId, draft);
        }
      }
    } catch (err) {
      console.error("❌ Sermon command error:", err);
      ctx.reply("Failed to start sermon note. Please try again.");
    }
  });

  // Handle button clicks
  bot.action("add_sermon_text", async (ctx) => {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId || !sermonDrafts.has(telegramId)) {
      return ctx.answerCbQuery("No active sermon note. Start one with /sermon");
    }
    
    await ctx.answerCbQuery("Please type your sermon text now...");
    await ctx.reply("✍️ Please type the text you'd like to add to your sermon:");
  });

  // Handle finish button
  bot.action("finish_sermon", async (ctx) => {
    try {
      const telegramId = ctx.from?.id?.toString();
      console.log('Finish button clicked by user:', telegramId);
      
      if (!telegramId || !sermonDrafts.has(telegramId)) {
        console.log('No active draft found for user:', telegramId);
        return ctx.answerCbQuery("No active sermon note to finish.");
      }

      const draft = sermonDrafts.get(telegramId);
      console.log('Current draft:', { 
        hasText: !!draft?.text,
        textLength: draft?.text?.length || 0,
        trimmedLength: draft?.text?.trim().length || 0 
      });

      if (!draft || !draft.text.trim()) {
        await ctx.answerCbQuery("Please add some text to your sermon first!");
        return;
      }

      await ctx.answerCbQuery("Saving your sermon...");
      console.log('Attempting to save sermon for user:', telegramId);
      await saveSermon(telegramId, draft.text, ctx);
    } catch (error) {
      console.error('Error in finish_sermon handler:', error);
      await ctx.answerCbQuery("An error occurred while saving your sermon.");
    }
  });

  // Handle text input for sermon
  bot.on("text", async (ctx: Context) => {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId || !sermonDrafts.has(telegramId)) return;
    
    // Skip if it's a command
    const text = (ctx.message as any).text;
    if (text.startsWith('/')) return;

    const draft = sermonDrafts.get(telegramId)!;
    const currentText = draft.text;
    const newText = currentText + (currentText ? "\n\n" : "") + text;
    
    // Update the draft
    draft.text = newText;
    sermonDrafts.set(telegramId, draft);

    // Update the message with the new content
    const preview = newText.length > 300 ? newText.substring(0, 300) + "..." : newText;
    
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback("➕ Add More Text", "add_sermon_text"),
      Markup.button.callback("✅ Finish", "finish_sermon")
    ]);

    try {
      if (draft.messageId) {
        await ctx.telegram.editMessageText(
          ctx.chat?.id,
          draft.messageId,
          undefined,
          `📝 *Sermon Note Editor*\n\n` +
          `Character count: ${newText.length}\n\n` +
          `*Current content:* \n${preview || "No text yet"}`,
          {
            parse_mode: 'Markdown',
            ...keyboard
          }
        );
      }
      
      await ctx.reply("✅ Text added to your sermon! Use the buttons above to add more or finish.");
    } catch (err) {
      console.error("Error updating sermon draft:", err);
    }
  });

  // Helper function to save the sermon
  async function saveSermon(telegramId: string, sermonText: string, ctx: Context) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      console.log('saveSermon called with:', { telegramId, textLength: sermonText.length });
      
      // Check database connection
      const db = mongoose.connection;
      if (db.readyState !== 1) {
        throw new Error('MongoDB not connected. Please check your database connection.');
      }
      
      // Find user with session
      const user = await User.findOne({ telegramId }).session(session).lean<{
        _id: any;
        role: string;
        username?: string;
      }>();
      
      if (!user) {
        console.error('User not found for telegramId:', telegramId);
        sermonDrafts.delete(telegramId);
        await session.abortTransaction();
        session.endSession();
        return ctx.reply("User account not found.");
      }
      
      if (user.role !== 'admin') {
        console.log('Permission denied for user:', { userId: user._id, role: user.role });
        sermonDrafts.delete(telegramId);
        await session.abortTransaction();
        session.endSession();
        return ctx.reply("You don't have permission to save sermon notes.");
      }

      // Extract title (first line) and content (rest)
      const [title, ...contentParts] = sermonText.split('\n');
      const content = contentParts.join('\n').trim();

      if (!content) {
        throw new Error('Sermon content cannot be empty');
      }

      const sermonData = {
        title: title || 'Untitled Sermon',
        content: content,
        date: new Date().toISOString().split("T")[0],
        uploader: user._id, // Mongoose will handle the ObjectId conversion
        isPublished: true
      };

      console.log('Creating sermon with data:', {
        ...sermonData,
        contentLength: sermonData.content.length,
        uploader: user._id.toString()
      });

      // Create and save sermon with transaction
      const sermon = new ServiceMedia(sermonData);
      const savedSermon = await sermon.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      console.log('Sermon saved successfully with ID:', savedSermon._id);
      sermonDrafts.delete(telegramId);

      // Remove the inline keyboard from the message
      if (ctx.callbackQuery?.message) {
        const message = ctx.callbackQuery.message;
        await ctx.telegram.editMessageReplyMarkup(
          message.chat.id,
          message.message_id,
          undefined,
          {
            inline_keyboard: []
          }
        );
      }

      const sermonTitle = sermon.title || 'Untitled Sermon';
      const sermonContent = sermon.content || '';
      const sermonDate = sermon.date || new Date().toISOString().split('T')[0];
      
      const preview = sermonContent.substring(0, 300) + (sermonContent.length > 300 ? '...' : '');
      const successMessage = `🎉 *Sermon Saved Successfully!*\n\n` +
        `📖 *${sermonTitle}*\n\n` +
        `📝 *Preview:*\n${preview}\n\n` +
        `📅 ${sermonDate}\n` +
        `👤 Uploaded by: ${user.username || 'Admin'}\n\n` +
        `_This sermon has been saved and published._`;

      await ctx.reply(successMessage, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error("❌ Error saving sermon:", err);
      
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
      
      session.endSession();
      
      // More detailed error message
          const error: Error = err as Error;
          const errorMessage: string = error.message || 'Unknown error occurred';
          console.error('Detailed error:', { 
            name: error.name || 'Error',
            message: errorMessage,
            stack: error.stack || 'No stack trace available'
          });
      
      await ctx.reply(`❌ Failed to save sermon: ${errorMessage}`);
    }
  }
};
