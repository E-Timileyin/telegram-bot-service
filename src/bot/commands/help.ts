import { Context, Telegraf } from "telegraf";

export const helpCommand = (bot: Telegraf) => {
    bot.command('help', async (ctx: Context) => {
        try {
            const helpMessage = `*STSTIC Media Bot Help* 

*Available Commands:*

*For All Users:*
/start - Start using the bot and see welcome message
/help - Show this help message
/latest - View the latest Sunday's media
/archive - Browse past Sunday services
/sermon - View latest sermon notes

*Admin Only:*
/sermon new - Create new sermon notes
/upload - Upload new media (photos/videos)
/makeadmin - Promote a user to admin (Owner only)

*How to Use:*
- Use /latest to see the most recent Sunday's media
- Use /archive to browse through previous services
- Admins can upload new media using /upload

*Need Help?*
Contact the admin if you have any questions or need assistance.`;

            await ctx.replyWithMarkdown(helpMessage);
        } catch (error) {
            console.error('Error in help command:', error);
            await ctx.reply('An error occurred while fetching help. Please try again later.');
        }
    });
};