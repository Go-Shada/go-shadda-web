import { Router } from 'express';
import { z } from 'zod';
import Order from '../models/Order';
import { requireAuth, JwtUser } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// List orders (admin sees recent, otherwise use /orders/mine)
router.get('/', async (_req, res) => {
  const orders = await Order.find().limit(50).sort({ createdAt: -1 });
  res.json(orders);
});

// Get single order with auth checks
router.get('/:id', requireAuth as any, async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const order = await Order.findById(id).populate('items.productId', 'name');
    if (!order) return res.status(404).json({ message: 'Not found' });
    // Access control: admin always; customer must own; vendor must match vendorId
    if (
      user.role !== 'admin' &&
      String(order.customerId) !== String(user.sub) &&
      (!user.vendorId || String(order.vendorId) !== String(user.vendorId))
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Authenticated: list my orders based on role
router.get('/mine', requireAuth as any, async (req, res) => {
  const user = (req as any).user as JwtUser;
  let filter: any = {};
  if (user.role === 'customer') filter.customerId = user.sub;
  else if (user.role === 'vendor') filter.vendorId = user.vendorId;
  // admin returns all recent orders
  const orders = await Order.find(filter).limit(100).sort({ createdAt: -1 });
  res.json(orders);
});

const createSchema = z.object({
  vendorId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      variant: z.object({ size: z.string().optional(), color: z.string().optional() }).optional(),
    })
  ),
});

// Create order: authenticated; customerId taken from token
router.post('/', requireAuth as any, async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    const body = createSchema.parse(req.body);
    const order = await Order.create({ ...body, customerId: user.sub, status: 'pending' } as any);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
