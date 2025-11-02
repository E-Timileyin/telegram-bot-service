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
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export default model<IServiceMedia>("ServiceMedia", ServiceMediaSchema);
