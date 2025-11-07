// src/services/AdminService.ts
import User from '../models/UserModel';
import ProductModel from '../models/ProductModel';
import Category from '../models/CategoryModel';

export interface AdminStats {
  users: {
    total: number;
    totalAdmins: number;
    totalRegularUsers: number;
    deletedUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    usersWithPhone: number;
    usersWithoutPhone: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    featured: number;
    lowStock: number; // stock < 10
  };
  categories: {
    total: number;
    active: number;
    mainCategories: number;
    subCategories: number;
  };
  recentActivity: {
    usersCreatedLast7Days: number;
    usersCreatedLast30Days: number;
  };
}

export class AdminService {
  /**
   * Get comprehensive admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfLast30Days = new Date(now);
    startOfLast30Days.setDate(now.getDate() - 30);

    // User statistics
    const [
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      deletedUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      usersCreatedLast30Days,
      usersWithPhone,
      usersWithoutPhone,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'admin', isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'user', isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: true }),
      User.countDocuments({
        createdAt: { $gte: startOfMonth },
        isDeleted: { $ne: true },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfWeek },
        isDeleted: { $ne: true },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfLast30Days },
        isDeleted: { $ne: true },
      }),
      User.countDocuments({
        $and: [
          { phone: { $exists: true, $ne: null } },
          { phone: { $ne: '' } },
          { isDeleted: { $ne: true } },
        ],
      }),
      User.countDocuments({
        $and: [
          {
            $or: [
              { phone: { $exists: false } },
              { phone: null },
              { phone: '' },
            ],
          },
          { isDeleted: { $ne: true } },
        ],
      }),
    ]);

    // Product statistics
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      lowStockProducts,
    ] = await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ isActive: true }),
      ProductModel.countDocuments({ isActive: false }),
      ProductModel.countDocuments({ featured: true, isActive: true }),
      ProductModel.countDocuments({ stock: { $lt: 10 }, isActive: true }),
    ]);

    // Category statistics
    const [
      totalCategories,
      activeCategories,
      mainCategories,
      subCategories,
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isMain: true, isActive: true }),
      Category.countDocuments({ isMain: false, isActive: true }),
    ]);

    return {
      users: {
        total: totalUsers,
        totalAdmins,
        totalRegularUsers,
        deletedUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        usersWithPhone,
        usersWithoutPhone,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        featured: featuredProducts,
        lowStock: lowStockProducts,
      },
      categories: {
        total: totalCategories,
        active: activeCategories,
        mainCategories,
        subCategories,
      },
      recentActivity: {
        usersCreatedLast7Days: newUsersThisWeek,
        usersCreatedLast30Days,
      },
    };
  }
}

