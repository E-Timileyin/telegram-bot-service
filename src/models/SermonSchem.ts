import mongoose, { Schema, Document } from "mongoose";

// Interface 
export interface IServiceMedia extends Document {
  uploader: mongoose.Types.ObjectId; // admin user who created it
  mediaType: string;                 // "sermon" for text-based sermons
  description: string;               // sermon text
  mediaUrls: string[];               // optional array (empty for text-only)
  eventType: string;                 // "sermon" or other event type
  date: string;                      // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const ServiceMediaSchema: Schema = new Schema<IServiceMedia>(
  {
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mediaType: { type: String, required: true },   // "sermon"
    description: { type: String, required: true },// sermon text
    mediaUrls: { type: [String], default: [] },   // empty array for text-only
    eventType: { type: String, required: true },  // "sermon"
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceMedia>("ServiceMedia", ServiceMediaSchema);
