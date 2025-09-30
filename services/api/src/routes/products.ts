import { Router } from 'express';
import { z } from 'zod';
import Product from '../models/Product';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Parse query params
    const {
      q,
      category,
      minPrice,
      maxPrice,
      color,
      size,
      inStock,
      sort = 'newest',
      page = '1',
      limit = '50',
    } = req.query as Record<string, string | undefined>;

    const filter: any = {};

    // text search (simple regex on name/description)
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    // categories (comma-separated)
    if (category) {
      const cats = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (cats.length) filter.categories = { $in: cats };
    }

    // price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
    }

    // variant-based filters
    if (color) filter['variants.color'] = color;
    if (size) filter['variants.size'] = size;
    if (inStock === 'true') filter['variants.stock'] = { $gt: 0 };

    // sorting
    let sortBy: any = { createdAt: -1 };
    if (sort === 'price_asc') sortBy = { price: 1 };
    else if (sort === 'price_desc') sortBy = { price: -1 };
    else if (sort === 'newest') sortBy = { createdAt: -1 };

    // pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

const createSchema = z.object({
  vendorId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string()).default([]),
});

router.post('/', async (req, res) => {
  try {
    const body = createSchema.parse(req.body);
    const product = await Product.create(body as any);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
