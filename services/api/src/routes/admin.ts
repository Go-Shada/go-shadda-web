import { Router } from 'express';
import { z } from 'zod';
import Vendor from '../models/Vendor';
import User from '../models/User';
import { requireAuth, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import Order from '../models/Order';

const router = Router();

// Create a vendor: creates a Vendor doc and a linked user with vendor role
const createVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  storeName: z.string().min(1),
  bio: z.string().optional(),
});

router.post('/vendors', requireAuth as any, requireRole(['admin']) as any, async (req, res) => {
  try {
    const { email, password, storeName, bio } = createVendorSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const vendor = await Vendor.create({ storeName, bio });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: 'vendor', vendorId: vendor._id } as any);
    res.status(201).json({ vendor, user: { _id: user._id, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// List/search vendors (simple pagination)
router.get('/vendors', requireAuth as any, requireRole(['admin']) as any, async (req, res) => {
  const { q, page = '1', limit = '20' } = req.query as Record<string, string | undefined>;
  const filter: any = {};
  if (q && q.trim()) {
    filter.storeName = { $regex: new RegExp(q.trim(), 'i') };
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  const [items, total] = await Promise.all([
    Vendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Vendor.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, limit: limitNum });
});

// Update vendor
const updateVendorSchema = z.object({ storeName: z.string().min(1).optional(), bio: z.string().optional() });
router.patch('/vendors/:id', requireAuth as any, requireRole(['admin']) as any, async (req, res) => {
  try {
    const patch = updateVendorSchema.parse(req.body);
    const updated = await Vendor.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Delete vendor and associated vendor users
router.delete('/vendors/:id', requireAuth as any, requireRole(['admin']) as any, async (req, res) => {
  const id = req.params.id;
  const v = await Vendor.findByIdAndDelete(id);
  if (!v) return res.status(404).json({ message: 'Not found' });
  await User.deleteMany({ vendorId: id });
  res.json({ ok: true });
});

// Admin analytics summary (GMV, orders, vendors)
router.get('/analytics/summary', requireAuth as any, requireRole(['admin']) as any, async (_req, res) => {
  const [vendorsCount, ordersAgg] = await Promise.all([
    Vendor.countDocuments({}),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: null, orders: { $addToSet: '$_id' }, gmv: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $project: { _id: 0, orders: { $size: '$orders' }, gmv: 1 } },
    ]),
  ]);
  const orders = ordersAgg[0]?.orders || 0;
  const gmv = ordersAgg[0]?.gmv || 0;
  res.json({ vendors: vendorsCount, orders, gmv });
});

// Admin analytics timeseries (daily GMV)
router.get('/analytics/timeseries', requireAuth as any, requireRole(['admin']) as any, async (_req, res) => {
  const series = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, gmv: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $addToSet: '$_id' } } },
    { $project: { date: '$_id', _id: 0, gmv: 1, orders: { $size: '$orders' } } },
    { $sort: { date: 1 } },
  ]);
  res.json(series);
});

// Top vendors and products across marketplace
router.get('/analytics/top', requireAuth as any, requireRole(['admin']) as any, async (_req, res) => {
  const [topVendors, topProducts] = await Promise.all([
    Order.aggregate([
      { $group: { _id: '$vendorId', gmv: { $sum: { $sum: { $map: { input: '$items', as: 'it', in: { $multiply: ['$$it.price', '$$it.quantity'] } } } } }, orders: { $sum: 1 } } },
      { $sort: { gmv: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
      { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, vendorId: '$_id', storeName: '$vendor.storeName', gmv: 1, orders: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', gmv: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, units: { $sum: '$items.quantity' } } },
      { $sort: { gmv: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, productId: '$_id', name: '$product.name', image: { $arrayElemAt: ['$product.images', 0] }, gmv: 1, units: 1 } },
    ]),
  ]);
  res.json({ topVendors, topProducts });
});

export default router;
