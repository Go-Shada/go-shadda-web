import mongoose, { Schema } from 'mongoose';

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  variant?: { size?: string; color?: string };
}

interface IOrder extends mongoose.Document {
  customerId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  tracking?: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  variant: { size: String, color: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    items: { type: [OrderItemSchema], default: [] },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    tracking: String,
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
