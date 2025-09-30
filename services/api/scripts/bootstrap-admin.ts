import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';
const MONGO_URI = (
  isDev
    ? (process.env.MONGO_URI_LOCAL || process.env.MONGO_URI)
    : (process.env.MONGO_URI || process.env.MONGO_URI_LOCAL)
) || 'mongodb://localhost:27017/campusthreads';

async function run() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo:', MONGO_URI);

  // Drop all non-system collections for a clean start
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo connection not initialized');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    if (!c.name.startsWith('system.')) {
      console.log('Dropping collection:', c.name);
      await db.dropCollection(c.name);
    }
  }

  // Create admin user
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await User.create({ email: ADMIN_EMAIL, passwordHash, role: 'admin' } as any);
  console.log('Admin created:', { email: admin.email, role: admin.role });

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
