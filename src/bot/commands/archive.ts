import { Telegraf, Context } from "telegraf";
import ServiceMedia from "../../models/ServiceMedia.Model.js";

interface ArchiveContext extends Context {
  match?: RegExpMatchArray | null;
}

export const archiveCommand = (bot: Telegraf) => {
  // Initial archive command
  bot.command("archive", async (ctx: Context) => {
    try {
      await ctx.reply("What would you like to view from the archive?", {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📷 Photos", callback_data: "archive_photos" },
              { text: "📝 Sermon Notes", callback_data: "archive_sermons" }
            ]
          ]
        }
      });
    } catch (err) {
      console.error("Archive command error:", err);
      ctx.reply("Error accessing archive. Please try again.");
    }
  });

  // Handle archive type selection
  bot.action(/archive_(photos|sermons)/, async (ctx: ArchiveContext) => {
    try {
      const archiveType = ctx.match?.[1];
      const isSermon = archiveType === 'sermons';
      
      // Find all unique dates that have the requested content
      const query = isSermon 
        ? { 
            $or: [
              { content: { $exists: true, $ne: "" } }, // Check for sermon content
              { sermonNotes: { $exists: true, $ne: "" } } // Legacy check
            ]
          }
        : { mediaUrls: { $exists: true, $not: { $size: 0 } } };
        
      console.log('Archive query:', JSON.stringify(query, null, 2));

      const dates = await ServiceMedia.find(query)
        .distinct("date")
        .sort({ date: -1 });

      if (dates.length === 0) {
        return ctx.editMessageText(
          isSermon 
            ? "No sermon notes found in the archive."
            : "No photos found in the archive."
        );
      }

      // Create buttons for each date (max 10 most recent)
      const buttons = dates.slice(0, 10).map(date => [
        { 
          text: date, 
          callback_data: `view_${isSermon ? 'sermon' : 'photos'}_${date}` 
        }
      ]);

      await ctx.editMessageText(
        `Select a date to view ${isSermon ? 'sermon notes' : 'photos'}:`,
        {
          reply_markup: { inline_keyboard: buttons }
        }
      );
    } catch (err) {
      console.error("Archive type selection error:", err);
      ctx.reply("Error fetching archive. Please try again.");
    }
  });
  // View sermon notes for a specific date
  bot.action(/view_sermon_(.+)/, async (ctx: ArchiveContext) => {
    try {
      const date = ctx.match?.[1];
      console.log(`Looking for sermons on date: ${date}`);
      
      // Find sermon entry for the selected date
      const sermon = await ServiceMedia.findOne({
        date: date,
        $or: [
          { content: { $exists: true, $ne: "" } }, // New format with content field
          { 
            mediaType: { $in: ["sermon", "text"] },
            $or: [
              { sermonNotes: { $exists: true, $ne: "" } },
              { description: { $exists: true, $ne: "" } }
            ]
          }
        ]
      }).sort({ createdAt: -1 });
      
      console.log('Sermon found:', sermon ? 'Yes' : 'No');
      if (sermon) {
        console.log('Sermon data:', {
          id: sermon._id,
          date: sermon.date,
          hasContent: !!sermon.content,
          hasSermonNotes: !!sermon.sermonNotes,
          hasDescription: !!(sermon as any).description
        });
      }
      
      if (!sermon) {
        console.log(`No sermon found for date: ${date}`);
        return ctx.editMessageText(`No sermon notes found for ${date}.`);
      }
      
      // Get the sermon text from any available field
      const sermonText = sermon.content || sermon.sermonNotes || (sermon as any).description;
      if (!sermonText) {
        console.log('Sermon found but no content:', sermon);
        return ctx.editMessageText("Sermon found but no content is available.");
      }
      
      // Include title if available
      const title = sermon.title ? `*${sermon.title}*\n\n` : '';
      
      // If there are media URLs, include them in the message
      const mediaLinks = sermon.mediaUrls?.length > 0 
        ? `\n\n📎 Media: ${sermon.mediaUrls.join('\n')}` 
        : '';
      
      // Prepare message options
      const messageOptions = {
        parse_mode: 'Markdown' as const,
        link_preview_options: { is_disabled: true }
      };
      
      await ctx.editMessageText(
        `📅 *${date}*` +
        `\n\n${title}${sermonText}` +
        mediaLinks,
        messageOptions
      );
    } catch (err) {
      console.error("View sermon error:", err);
      ctx.reply("Error loading sermon notes. Please try again.");
    }
  });

  // View photos for a specific date
  bot.action(/view_photos_(.+)/, async (ctx: ArchiveContext) => {
    try {
      const date = ctx.match?.[1];
      const media = await ServiceMedia.findOne({
        date: date,
        mediaUrls: { $exists: true, $not: { $size: 0 } }
      });

      if (!media || !media.mediaUrls?.length) {
        return ctx.editMessageText(`No photos found for ${date}.`);
      }

      // Send media group with all photos
      const mediaGroup = media.mediaUrls.map((url, index) => ({
        type: 'photo' as const,
        media: { source: url },
        caption: index === 0 ? `📅 ${date}` : undefined
      }));

      // @ts-ignore - The type definition seems to be incorrect in the library
      await ctx.replyWithMediaGroup(mediaGroup);
      await ctx.reply(
        `📅 ${date}\n` +
        `📷 ${media.mediaUrls.length} photo(s)`
      );
    } catch (err) {
      console.error("View photos error:", err);
      ctx.reply("Error loading photos. Please try again.");
    }
  });

  // View sermon notes for a specific date
  bot.action(/view_sermon_(.+)/, async (ctx: ArchiveContext) => {
    try {
      const date = ctx.match?.[1];
      const media = await ServiceMedia.findOne({
        date: date,
        sermonNotes: { $exists: true, $ne: "" }
      });

      if (!media?.sermonNotes) {
        return ctx.editMessageText(`No sermon notes found for ${date}.`);
      }

      await ctx.editMessageText(
        `📝 *Sermon Notes - ${date}*\n\n${media.sermonNotes}\n\n` +
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error("View sermon error:", err);
      ctx.reply("Error loading sermon notes. Please try again.");
    }
  });
};
