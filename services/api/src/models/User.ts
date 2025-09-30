import mongoose, { Schema } from 'mongoose';

export type Role = 'customer' | 'vendor' | 'admin';

interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  role: Role;
  profile?: { displayName?: string; avatarUrl?: string; campus?: string; phone?: string; address?: string };
  vendorId?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    profile: {
      displayName: String,
      avatarUrl: String,
      campus: String,
      phone: String,
      address: String,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
