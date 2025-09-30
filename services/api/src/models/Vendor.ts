import mongoose, { Schema } from 'mongoose';

interface IVendor extends mongoose.Document {
  storeName: string;
  bio?: string;
  ratings?: number;
}

const VendorSchema = new Schema<IVendor>(
  {
    storeName: { type: String, required: true },
    bio: String,
    ratings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>('Vendor', VendorSchema);
