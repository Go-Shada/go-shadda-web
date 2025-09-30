import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV !== 'production';
const MONGO_URI = (
  isDev
    ? (process.env.MONGO_URI_LOCAL || process.env.MONGO_URI)
    : (process.env.MONGO_URI || process.env.MONGO_URI_LOCAL)
) || 'mongodb://localhost:27017/campusthreads';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected to', MONGO_URI);

    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
