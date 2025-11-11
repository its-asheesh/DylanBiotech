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

export type AdminLevel = 1 | 2 | 3; // MODERATOR = 1, ADMIN = 2, SUPER_ADMIN = 3

export type Permission = 
  | 'view_users' | 'manage_users' | 'delete_users' | 'manage_user_roles'
  | 'view_products' | 'create_products' | 'update_products' | 'delete_products'
  | 'view_categories' | 'manage_categories'
  | 'view_tag_categories' | 'manage_tag_categories'
  | 'view_admins' | 'manage_admins' | 'manage_admin_permissions'
  | 'view_analytics' | 'view_dashboard'
  | 'manage_settings';

export interface Admin {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin';
  adminLevel?: AdminLevel;
  permissions?: Permission[];
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface ListAdminsResponse {
  success: boolean;
  admins: Admin[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminResponse {
  success: boolean;
  admin: Admin;
  message?: string;
}

export interface UpdateAdminPermissionsInput {
  adminLevel?: AdminLevel;
  permissions?: Permission[];
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

/**
 * List all admins (Super admin only)
 */
export async function listAdmins(params?: {
  page?: number;
  limit?: number;
  adminLevel?: AdminLevel;
  search?: string;
  includeDeleted?: boolean;
}): Promise<ListAdminsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.adminLevel) queryParams.append('adminLevel', params.adminLevel.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.includeDeleted) queryParams.append('includeDeleted', 'true');

  const response = await apiFetch<ListAdminsResponse>(`/admin/admins?${queryParams.toString()}`);
  return response;
}

/**
 * Get admin by ID (Super admin only)
 */
export async function getAdminById(adminId: string): Promise<AdminResponse> {
  const response = await apiFetch<AdminResponse>(`/admin/admins/${adminId}`);
  return response;
}

/**
 * Update admin permissions and level (Super admin only)
 */
export async function updateAdminPermissions(
  adminId: string,
  updates: UpdateAdminPermissionsInput
): Promise<AdminResponse> {
  const response = await apiFetch<AdminResponse>(`/admin/admins/${adminId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response;
}

/**
 * Grant permission to admin (Super admin only)
 */
export async function grantPermission(
  adminId: string,
  permission: Permission
): Promise<AdminResponse> {
  const response = await apiFetch<AdminResponse>(`/admin/admins/${adminId}/permissions/grant`, {
    method: 'POST',
    body: JSON.stringify({ permission }),
  });
  return response;
}

/**
 * Revoke permission from admin (Super admin only)
 */
export async function revokePermission(
  adminId: string,
  permission: Permission
): Promise<AdminResponse> {
  const response = await apiFetch<AdminResponse>(`/admin/admins/${adminId}/permissions/revoke`, {
    method: 'POST',
    body: JSON.stringify({ permission }),
  });
  return response;
}

/**
 * Promote user to admin (via user role update)
 */
export async function promoteUserToAdmin(
  userId: string,
  adminLevel?: AdminLevel
): Promise<{ success: boolean; user: any; message?: string }> {
  const response = await apiFetch<{ success: boolean; user: any; message?: string }>(
    `/users/${userId}/role`,
    {
      method: 'PUT',
      body: JSON.stringify({ role: 'admin', adminLevel }),
    }
  );
  return response;
}

