import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import vendorRouter from './routes/vendor';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
// Configure CORS: credentials cannot be used with wildcard origin.
// Prefer CORS_ORIGIN env (comma-separated list), else default to localhost:3000 for local dev.
const allowedOrigins = (process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean)) || ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter);

// Static file hosting for uploads (e.g., product images)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

export default app;
