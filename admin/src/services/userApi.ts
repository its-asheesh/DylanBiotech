// src/services/userApi.ts
import { apiFetch } from '../utils/apiFetch';
import type { AdminLevel } from './adminApi';

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  adminLevel?: AdminLevel;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: 'user' | 'admin';
  search?: string;
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
  createdFrom?: string;
  createdTo?: string;
  hasPhone?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'role' | 'deletedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListUsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface UpdateUserRoleInput {
  role: 'user' | 'admin';
  adminLevel?: AdminLevel;
}

/**
 * List all users with filters and pagination
 */
export async function listUsers(params?: ListUsersParams): Promise<ListUsersResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.role) queryParams.append('role', params.role);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.includeDeleted) queryParams.append('includeDeleted', 'true');
  if (params?.onlyDeleted) queryParams.append('onlyDeleted', 'true');
  if (params?.createdFrom) queryParams.append('createdFrom', params.createdFrom);
  if (params?.createdTo) queryParams.append('createdTo', params.createdTo);
  if (params?.hasPhone !== undefined) queryParams.append('hasPhone', params.hasPhone.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiFetch<ListUsersResponse>(`/users?${queryParams.toString()}`);
  return response;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  const response = await apiFetch<UserResponse>(`/users/${userId}`);
  return response;
}

/**
 * Update user role (promote/demote)
 */
export async function updateUserRole(
  userId: string,
  data: UpdateUserRoleInput
): Promise<UserResponse> {
  const response = await apiFetch<UserResponse>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response;
}

/**
 * Delete user (soft delete by default, hard delete with hardDelete=true)
 */
export async function deleteUser(
  userId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; message: string }> {
  const queryParams = hardDelete ? '?hardDelete=true' : '';
  const response = await apiFetch<{ success: boolean; message: string }>(
    `/users/${userId}${queryParams}`,
    {
      method: 'DELETE',
    }
  );
  return response;
}

/**
 * Restore deleted user
 */
export async function restoreUser(userId: string): Promise<UserResponse> {
  const response = await apiFetch<UserResponse>(`/users/${userId}/restore`, {
    method: 'POST',
  });
  return response;
}


