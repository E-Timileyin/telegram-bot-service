import { Schema, model, Document, Types } from "mongoose";

export interface ISermon extends Document {
  title: string;
  content: string;
  preacher?: string;
  bibleReferences?: string[];
  date: string; // YYYY-MM-DD format
  uploader: Types.ObjectId; // Reference to User who uploaded
  categories?: Types.ObjectId[]; // Optional sermon categories
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SermonSchema = new Schema<ISermon>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    preacher: { type: String },
    bibleReferences: { type: [String], default: [] },
    date: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<ISermon>("Sermon", SermonSchema);
