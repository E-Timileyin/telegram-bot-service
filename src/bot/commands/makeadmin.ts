import { Telegraf, Context } from "telegraf";
import User from "../../models/User.Model.js";

const OWNER_ID = process.env.OWNER_ID; // Set this in your .env file

export const makeAdminCommand = (bot: Telegraf) => {
  bot.command("makeadmin", async (ctx: Context) => {
    try {
      // Only owner can promote admins
      const userId = ctx.from?.id?.toString();
      if (userId !== OWNER_ID) {
        return ctx.reply("You don't have permission to use this command.");
      }

      // Get the user to be promoted (reply to their message or use a parameter)
      const repliedTo = (ctx.message as any)?.reply_to_message;
      let targetTelegramId: string | undefined;

      if (repliedTo) {
        // If replying to someone's message
        targetTelegramId = repliedTo.from?.id?.toString();
      } else {
        // Or parse from command argument: /makeadmin 123456789
        const args = (ctx.message as any)?.text?.split(" ");
        targetTelegramId = args?.[1];
      }

      if (!targetTelegramId) {
        return ctx.reply(
          "Usage: Reply to a user's message with /makeadmin or /makeadmin <telegram_id>"
        );
      }

      // Find or create user and set as admin
      const user = await User.findOneAndUpdate(
        { telegramId: targetTelegramId },
        { role: "admin", telegramId: targetTelegramId },
        { upsert: true, new: true }
      );

      ctx.reply(`User ${targetTelegramId} is now an admin!`);
    } catch (err) {
      console.error("Makeadmin error:", err);
      ctx.reply("Error promoting user. Try again.");
    }
  });
};
