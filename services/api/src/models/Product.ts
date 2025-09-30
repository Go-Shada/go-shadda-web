import mongoose, { Schema } from 'mongoose';

interface IVariant {
  size: string;
  color: string;
  stock: number;
}

interface IProduct extends mongoose.Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  images: string[];
  categories?: string[];
  variants?: IVariant[];
}

const VariantSchema = new Schema<IVariant>({
  size: String,
  color: String,
  stock: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
