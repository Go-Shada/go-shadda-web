import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import Vendor from '../src/models/Vendor';
import Product from '../src/models/Product';
import User from '../src/models/User';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';
const MONGO_URI = (
  isDev
    ? (process.env.MONGO_URI_LOCAL || process.env.MONGO_URI)
    : (process.env.MONGO_URI || process.env.MONGO_URI_LOCAL)
) || 'mongodb://localhost:27017/campusthreads';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo:', MONGO_URI);

  // optional: clean existing data
  await Promise.all([
    Product.deleteMany({}),
    Vendor.deleteMany({}),
    // Do not wipe users in general; but create demo vendors and customers
  ]);

  const demoPassword = process.env.DEMO_PASSWORD || 'password123';
  const demoHash = await bcrypt.hash(demoPassword, 10);

  // Create demo vendors and associated users
  const vendorCount = 12;
  const vendors = [] as Array<{ _id: any; storeName: string }>;
  for (let i = 0; i < vendorCount; i++) {
    const v = await Vendor.create({
      storeName: `${faker.company.name()} Threads`,
      bio: faker.company.catchPhrase(),
      ratings: Math.round(faker.number.float({ min: 3, max: 5, multipleOf: 0.1 }) * 10) / 10,
    });
    vendors.push(v as any);

    const email = `vendor${i + 1}@example.edu`;
    await User.updateOne(
      { email },
      { $set: { email, passwordHash: demoHash, role: 'vendor', vendorId: v._id } },
      { upsert: true }
    );
  }

  // Create a few demo customers
  for (let i = 0; i < 8; i++) {
    const email = `customer${i + 1}@example.com`;
    await User.updateOne(
      { email },
      { $set: { email, passwordHash: demoHash, role: 'customer' } },
      { upsert: true }
    );
  }

  // Ensure an admin user exists
  await User.updateOne(
    { email: 'admin@example.com' },
    { $set: { email: 'admin@example.com', passwordHash: demoHash, role: 'admin' } },
    { upsert: true }
  );

  // Generate 100 products across vendors
  const categories = ['tees', 'hoodies', 'sweatshirts', 'caps', 'beanies', 'jackets', 'accessories'];
  const colors = ['black', 'white', 'navy', 'red', 'green', 'purple'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const productsToInsert: any[] = [];
  for (let i = 0; i < 100; i++) {
    const vendor = faker.helpers.arrayElement(vendors);
    const name = `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(['Campus', 'Dorm', 'Club', 'Society'])} ${faker.commerce.product()}`;
    const description = faker.commerce.productDescription();
    const price = Number(faker.commerce.price({ min: 10, max: 120, dec: 2 }));
    const images = [
      `https://picsum.photos/seed/${encodeURIComponent(name)}-${i}/800/800`,
    ];
    const cat = faker.helpers.arrayElements(categories, faker.number.int({ min: 1, max: 2 }));

    const variants = sizes.slice(0, faker.number.int({ min: 2, max: 5 })).map((size) => ({
      size,
      color: faker.helpers.arrayElement(colors),
      stock: faker.number.int({ min: 0, max: 50 }),
    }));

    productsToInsert.push({
      vendorId: vendor._id,
      name,
      description,
      price,
      images,
      categories: cat,
      variants,
    });
  }

  await Product.insertMany(productsToInsert);
  console.log(`Inserted ${productsToInsert.length} products across ${vendors.length} vendors.`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
