import { Schema, model, Document, Types } from "mongoose";

export interface IServiceMedia extends Document {
  uploader: Types.ObjectId;           
  eventType: "CurrentSunday" | "FirstSunday" | "SpecialEvent";
  date: string;                      
  mediaUrls: string[];                 
  mediaType: "photo" | "video" | "audio" | "text";
  captions?: string;
  sermonNotes?: string;                
  category?: Types.ObjectId;           
  title?: string;                     // Sermon title
  content?: string;                   // Main sermon content
  bibleReferences?: string[];         // Array of scripture references
  isPublished?: boolean;              // Publication status
  createdAt?: Date;
  updatedAt?: Date;
}

const ServiceMediaSchema = new Schema<IServiceMedia>(
  {
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventType: { type: String, enum: ["CurrentSunday", "FirstSunday", "SpecialEvent"], default: "CurrentSunday" },
    date: { type: String, required: true },
    mediaUrls: { 
      type: [String],
      required: function() { 
        return this.mediaType !== 'text'; 
      } 
    },
    mediaType: { type: String, enum: ["photo", "video", "audio", "text"], default: "photo" },
    captions: { type: String },
    sermonNotes: { type: String },
    title: { type: String },
    content: { type: String },
    bibleReferences: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export default model<IServiceMedia>("ServiceMedia", ServiceMediaSchema);
