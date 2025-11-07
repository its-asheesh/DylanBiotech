// src/server.ts (or index.ts)
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import cookieParser from "cookie-parser";

// ✅ Initialize Firebase Admin FIRST
import './firebase-admin'; // 👈 SIDE EFFECT — initializes admin

// Local modules
import connectDB from './config/db';
import { connectRedis } from './redis';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { sanitize } from './middleware/validationMiddleware';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import tagCategoryRoutes from './routes/tagCategoryRoutes';



// Connect to databases
connectDB();
connectRedis().catch(console.error);


const app = express();

// Security & middleware
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  'http://localhost:3003', // Admin panel
  process.env.NGROK_URL,
].filter(Boolean)
app.use(cors({
  origin: (origin, callback) => {
    if(!origin || allowedOrigins.includes(origin)){
      callback(null, true);
    }else{
      callback(new Error('CORS not allowed'))
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

// Sanitize all incoming requests to prevent injection attacks
app.use(sanitize);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tag-categories', tagCategoryRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});