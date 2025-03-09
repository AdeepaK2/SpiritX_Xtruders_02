import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  password: string;
  role: 'admin';
}

const adminSchema: Schema = new Schema(
  {
    adminId: { type: mongoose.Types.ObjectId },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Admin', required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
