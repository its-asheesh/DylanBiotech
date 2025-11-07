// src/routes/adminRoutes.ts
import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication and admin role
router.get('/stats', protect, isAdmin, getDashboardStats);

export default router;

