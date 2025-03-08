import mongoose, { Schema, Document } from "mongoose";

export interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<Iuser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.models.user || mongoose.model<Iuser>("user", userSchema);
