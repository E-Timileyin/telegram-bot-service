

---
## Strong Tower Church ( TIC ) 

# Folder Structure

media-bot/
│
├── src/
│   ├── app.js                  # Main Express app entry
│   ├── bot/                    # Telegram bot logic
│   │   ├── index.js            # Bot initialization (Telegraf instance)
│   │   ├── commands/           # Command handlers (/start, /photos, /history)
│   │   │   ├── start.js
│   │   │   ├── photos.js
│   │   │   ├── history.js
│   │   └── middlewares/        # Middlewares for admin auth, validation
│   │       └── auth.js
│   │
│   ├── config/                 # Configurations
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary config
│   │   └── env.js              # Environment variable loader
│   │
│   ├── models/                 # Mongoose models
│   │   └── Photo.js
│   │
│   ├── routes/                 # Express routes
│   │   ├── admin.routes.js     # Upload & management routes for admin
│   │   ├── public.routes.js    # General info routes
│   │
│   ├── services/               # External services / logic
│   │   ├── upload.service.js   # Handles media uploads
│   │   └── photo.service.js    # CRUD logic for photos
│   │
│   ├── utils/                  # Utility helpers
│   │   ├── logger.js           # Winston/Pino logger setup
│   │   ├── response.js         # Unified success/error response
│   │   └── validator.js        # Input validation helper
│   │
│   ├── index.js                # Server bootstrap (starts Express + Bot)
│   └── constants/              # Central constants and enums
│       └── messages.js         # Reusable bot messages
│
├── .env                        # Environment variables
├── .gitignore
├── package.json
├── README.md
└── nodemon.json                # Dev auto-restart config

---

### Current (MVP) Features

1. Bot initialization and command handling

   * `/start` command greeting users
   * Basic message handling via Telegraf
2. Media upload by admin

   * Admin authentication (ID or role check)
   * Upload image(s) to Cloudinary (or similar)
   * Store metadata (URL, caption, date) in database
3. Media retrieval by users

   * `/sunday` command: fetch and send current Sunday’s images
   * `/previous` command: list past Sundays and allow selection
4. Storage & metadata management

   * Database schema for media (URL, date, caption)
   * Cloud storage for actual media files
5. Folder/Date organisation of media

   * Store media under a folder structure by Sunday date
   * Allows easy retrieval by date
6. Basic error handling & permissions

   * Prevent non-admins uploading
   * Handle “no media found” responses
7. Bot hosting & webhook/polling setup

   * Bot running persistently
   * Webhook or polling mode configured

---

### Future Features

1. Media categories / albums

   * Separate by event type (e.g., Weddings, Youth, Outreach)
2. Caption & description support

   * Admin adds caption or Bible verse to each image
   * Display captions when sending media
3. Pagination & inline navigation

   * Media groups with inline buttons for “Next” / “Prev”
4. Scheduled posts / highlights

   * Bot automatically sends weekly highlight of Sunday images
   * Cron job to trigger auto-send
5. Video / audio support

   * Upload and serve short video clips or worship audio
6. Admin dashboard / web panel

   * Web UI for media management, uploads, captions, analytics
7. User management & roles

   * Track users, register members, assign roles (Admin, Member)
8. Search & filtering

   * Search media by date, category, keyword
9. Devotional & announcement features

   * Daily/weekly devotionals via bot
   * Prayer requests submission
   * Announcement broadcasting
10. Analytics & usage tracking

    * Track how many users viewed each Sunday’s photos
    * Engagement metrics
11. Multi-platform support / broadcasts

    * Integrate with WhatsApp or email newsletters
    * Cross-post selected highlights to social media
12. AI / automation enhancements

    * Auto-generate captions (using AI)
    * Auto-optimize media (compression, formats)
13. Localization & accessibility

    * Multi-language support (e.g., English + Yoruba)
    * Voice messages or TTS for visually impaired users



    