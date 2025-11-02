import User from "../models/User.Model.js";
import { config } from "../config/env.js";

export const ensureAdminUser = async () => {
  try {
    if (!config.ownerId) {
      console.error("OWNER_ID is not set in environment variables");
      return;
    }

    // Check if admin user exists
    const adminUser = await User.findOne({ 
      telegramId: config.ownerId,
      role: "admin" 
    });

    if (!adminUser) {
      // Create admin user if not exists
      await User.findOneAndUpdate(
        { telegramId: config.ownerId },
        { 
          username: "admin",
          role: "admin",
          joinedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log("Admin user created/updated successfully");
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error);
  }
};
