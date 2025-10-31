import { Schema, model, Document, Types } from "mongoose";

export interface IServiceMedia extends Document {
  uploader: Types.ObjectId;           
  eventType: "CurrentSunday" | "FirstSunday" | "SpecialEvent";
  date: string;                      
  mediaUrls: string[];                 
  mediaType: "photo" | "video" | "audio";
  captions?: string;
  category?: Types.ObjectId;           
  createdAt?: Date;
  updatedAt?: Date;
}

const ServiceMediaSchema = new Schema<IServiceMedia>(
  {
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventType: { type: String, enum: ["CurrentSunday", "FirstSunday", "SpecialEvent"], default: "CurrentSunday" },
    date: { type: String, required: true },
    mediaUrls: [{ type: String, required: true }],
    mediaType: { type: String, enum: ["photo", "video", "audio"], default: "photo" },
    captions: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export default model<IServiceMedia>("ServiceMedia", ServiceMediaSchema);
