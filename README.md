# Telegram Bot

A Telegram bot for managing and delivering statistical data, sermons, and media content. Built with TypeScript, Telegraf, and MongoDB.

## 🚀 Features

- **Sermon Management**: Upload, organize, and deliver sermon content
- **Media Handling**: Manage and serve various media types including audio and video
- **User Interaction**: Interactive commands for users to access content
- **Admin Controls**: Secure administration features for content management
- **Statistics**: Track usage and engagement metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Telegraf (Telegram Bot Framework)
- **Database**: MongoDB with Mongoose ODM
- **Media Storage**: Cloudinary
- **Package Manager**: npm

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express application setup
├── bot/
│   ├── commands/         # Bot command handlers
│   │   ├── archive.ts
│   │   ├── sermon.ts
│   │   └── start.ts
│   ├── middlewares/      # Bot middleware functions
│   └── bot.ts            # Main bot configuration
├── config/               # Configuration files
├── models/               # Database models
│   └── ServiceMedia.Model.ts
├── utils/                # Utility functions
└── index.ts              # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB database
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- Cloudinary account (for media storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ststic-telegram-bot.git
   cd ststic-telegram-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   BOT_TOKEN=your_telegram_bot_token
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Bot

- **Development mode** (with auto-restart):
  ```bash
  npm run dev
  ```

- **Production mode**:
  ```bash
  npm start
  ```

## 🤖 Available Commands

- `/start` - Start interacting with the bot
- `/sermon` - Access sermon content
- `/archive` - Browse archived content

## 🔧 Development

### Building the Project

```bash
# Build TypeScript files
npm run build

# Lint the code
npm run lint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram Bot API token | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Telegraf](https://telegraf.js.org/) - Modern Telegram bot framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Cloudinary](https://cloudinary.com/) - Media management service

## 📬 Contact

Eyiowuawi Timileyin - [@your_telegram](https://t.me/your_telegram)

Project Link: [https://github.com/yourusername/ststic-telegram-bot](https://github.com/yourusername/ststic-telegram-bot)
