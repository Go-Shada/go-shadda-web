import { Router, Request } from 'express';
import { z } from 'zod';
import Product from '../models/Product';
import { requireAuth, requireRole, JwtUser } from '../middleware/auth';
import Order from '../models/Order';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// All routes require vendor auth
router.use(requireAuth as any, requireRole(['vendor']) as any);

// List products for the logged-in vendor
router.get('/products', async (req, res) => {
  const user = (req as any).user as JwtUser;
  if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
  const items = await Product.find({ vendorId: user.vendorId }).sort({ createdAt: -1 });
  res.json(items);
});

// Create a product for this vendor
const VariantSchemaZ = z.object({ size: z.string().optional(), color: z.string().optional(), stock: z.number().int().nonnegative().default(0) });
const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string()).default([]).optional(),
  categories: z.array(z.string()).default([]).optional(),
  variants: z.array(VariantSchemaZ).optional(),
});

router.post('/products', async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
    const body = createSchema.parse(req.body);
    const product = await Product.create({ ...body, vendorId: user.vendorId } as any);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Update a vendor's product
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  variants: z.array(VariantSchemaZ).optional(),
});

router.patch('/products/:id', async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
    const patch = updateSchema.parse(req.body);
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, vendorId: user.vendorId },
      { $set: patch },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a vendor's product
router.delete('/products/:id', async (req, res) => {
  const user = (req as any).user as JwtUser;
  if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
  const deleted = await Product.findOneAndDelete({ _id: req.params.id, vendorId: user.vendorId });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

// Upload endpoint: accepts a single image file and returns a public URL
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: any, destination: string) => void) => cb(null, uploadsDir),
  filename: (_req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({ storage });

router.post('/uploads', upload.single('file'), async (req, res) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // Construct public URL (served by app at /uploads)
    const filename = path.basename(file.path);
    const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const url = `${apiBase}/uploads/${filename}`;
    res.status(201).json({ url });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Adjust inventory: add to stock for all variants or clear stock
const inventorySchema = z.object({ action: z.enum(['add', 'clear']), amount: z.number().int().positive().optional() });
router.post('/products/:id/inventory', async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
    const { action, amount } = inventorySchema.parse(req.body);
    const product = await Product.findOne({ _id: req.params.id, vendorId: user.vendorId });
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (action === 'clear') {
      product.variants = (product.variants || []).map((v: any) => ({ ...v, stock: 0 }));
    } else if (action === 'add') {
      const inc = amount || 1;
      product.variants = (product.variants || []).map((v: any) => ({ ...v, stock: (v.stock || 0) + inc }));
    }
    await product.save();
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Vendor orders: list and update status
router.get('/orders', async (req, res) => {
  const user = (req as any).user as JwtUser;
  if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
  const orders = await Order.find({ vendorId: user.vendorId })
    .sort({ createdAt: -1 })
    .populate('items.productId', 'name images');
  res.json(orders);
});

const statusSchema = z.object({ status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']) });
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
    const { status } = statusSchema.parse(req.body);
    const order = await Order.findOne({ _id: req.params.id, vendorId: user.vendorId });
    if (!order) return res.status(404).json({ message: 'Not found' });

    const prevStatus = order.status;
    order.status = status as any;

    // If transitioning into 'delivered', decrement product stock accordingly (idempotent: only when previous status wasn't delivered)
    if (status === 'delivered' && prevStatus !== 'delivered') {
      for (const item of order.items || []) {
        const product = await Product.findOne({ _id: item.productId, vendorId: user.vendorId });
        if (!product) continue;
        // If variant info is present, decrement that variant, otherwise decrement first variant
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          let decremented = false;
          if (item.variant?.size || item.variant?.color) {
            for (const v of product.variants as any[]) {
              if (
                (item.variant?.size ? v.size === item.variant.size : true) &&
                (item.variant?.color ? v.color === item.variant.color : true)
              ) {
                v.stock = Math.max(0, (v.stock || 0) - (item.quantity || 0));
                decremented = true;
                break;
              }
            }
          }
          if (!decremented) {
            // fallback: decrement first variant
            const v0: any = (product.variants as any[])[0];
            v0.stock = Math.max(0, (v0.stock || 0) - (item.quantity || 0));
          }
        }
        await product.save();
      }
    }

    await order.save();
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

// Vendor analytics endpoints (after export to keep file order clear)
router.get('/analytics/summary', async (req, res) => {
  const user = (req as any).user as JwtUser;
  if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
  const [ordersAgg] = await Promise.all([
    Order.aggregate([
      { $match: { vendorId: new (require('mongoose').Types.ObjectId)(user.vendorId) } },
      { $unwind: '$items' },
      { $group: { _id: null, orders: { $addToSet: '$_id' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $project: { _id: 0, orders: { $size: '$orders' }, revenue: 1 } },
    ]),
  ]);
  res.json({ orders: ordersAgg?.[0]?.orders || 0, revenue: ordersAgg?.[0]?.revenue || 0 });
});

router.get('/analytics/timeseries', async (req, res) => {
  const user = (req as any).user as JwtUser;
  if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
  const series = await Order.aggregate([
    { $match: { vendorId: new (require('mongoose').Types.ObjectId)(user.vendorId) } },
    { $unwind: '$items' },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $addToSet: '$_id' } } },
    { $project: { date: '$_id', _id: 0, revenue: 1, orders: { $size: '$orders' } } },
    { $sort: { date: 1 } },
  ]);
  res.json(series);
});

// Top products by revenue and units for this vendor
router.get('/analytics/top-products', async (req, res) => {
  const user = (req as any).user as JwtUser;
  if (!user.vendorId) return res.status(400).json({ message: 'No vendorId on user' });
  const vendorObjectId = new (require('mongoose').Types.ObjectId)(user.vendorId);
  const top = await Order.aggregate([
    { $match: { vendorId: vendorObjectId } },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, units: { $sum: '$items.quantity' } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, productId: '$_id', name: '$product.name', image: { $arrayElemAt: ['$product.images', 0] }, revenue: 1, units: 1 } },
  ]);
  res.json(top);
});
