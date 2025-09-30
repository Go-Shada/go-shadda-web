import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { requireAuth, JwtUser } from '../middleware/auth';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['customer', 'vendor']).optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  campus: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Authenticated uploads (e.g., user avatar)
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const authStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const authUpload = multer({ storage: authStorage });

router.post('/uploads', requireAuth as any, authUpload.single('file'), async (req, res) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const filename = path.basename(file.path);
    const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const url = `${apiBase}/uploads/${filename}`;
    res.status(201).json({ url });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, displayName, avatarUrl, campus, phone, address } = registerSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role: role || 'customer',
      profile: {
        ...(displayName ? { displayName } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(campus ? { campus } : {}),
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
      },
    } as any);
    res.status(201).json({ _id: user._id, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id, role: user.role, vendorId: user.vendorId }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, email: user.email, role: user.role, vendorId: user.vendorId } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

// Me: return currently authenticated user details
router.get('/me', requireAuth as any, async (req, res) => {
  const user = (req as any).user as JwtUser;
  const doc = await User.findById(user.sub).lean();
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ _id: doc._id, email: doc.email, role: doc.role, vendorId: (doc as any).vendorId, profile: doc.profile });
});

// Update profile (displayName, avatarUrl, campus, phone, address)
const profileSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  campus: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional(),
});

router.patch('/profile', requireAuth as any, async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    const body = profileSchema.parse(req.body);
    const doc = await User.findById(user.sub);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    // Optionally update email if provided and unique
    if (body.email && body.email !== doc.email) {
      const exists = await User.findOne({ email: body.email });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      doc.email = body.email;
    }
    doc.profile = {
      ...(doc.profile || {} as any),
      displayName: body.displayName ?? (doc.profile as any)?.displayName,
      avatarUrl: body.avatarUrl ?? (doc.profile as any)?.avatarUrl,
      campus: body.campus ?? (doc.profile as any)?.campus,
      // add new fields in profile
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.address ? { address: body.address } : {}),
    } as any;
    await doc.save();
    res.json({ _id: doc._id, email: doc.email, role: doc.role, vendorId: (doc as any).vendorId, profile: doc.profile });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Change password
const passwordSchema = z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6) });
router.patch('/password', requireAuth as any, async (req, res) => {
  try {
    const user = (req as any).user as JwtUser;
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const doc = await User.findById(user.sub);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    const ok = await bcrypt.compare(currentPassword, doc.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid current password' });
    doc.passwordHash = await bcrypt.hash(newPassword, 10);
    await doc.save();
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
