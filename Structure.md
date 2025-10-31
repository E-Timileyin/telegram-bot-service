

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
