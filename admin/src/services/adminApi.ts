// src/services/adminApi.ts
import { apiFetch } from '../utils/apiFetch';

export interface DashboardStats {
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
    lowStock: number;
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

export interface ApiResponse<T> {
  success: boolean;
  stats?: T;
  message?: string;
}

/**
 * Fetch admin dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiFetch<ApiResponse<DashboardStats>>('/admin/stats');
  
  if (!response.success || !response.stats) {
    throw new Error(response.message || 'Failed to fetch dashboard statistics');
  }
  
  return response.stats;
}

