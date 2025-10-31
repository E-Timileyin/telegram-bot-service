import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  telegramId: string;
  username: string;
  role: "admin" | "member";
  joinedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    telegramId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
