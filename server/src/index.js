import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { prisma } from './prisma/client.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import formRoutes from './routes/formRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import path from 'path';

const app = express();
const port = Number(process.env.PORT) || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/cms', cmsRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(port, () => {
      console.log(`AGGE API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
