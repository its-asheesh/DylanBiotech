// src/controllers/adminController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AdminService } from '../services/AdminService';

const adminService = new AdminService();

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      stats,
    });
  }
);

