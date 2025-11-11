// src/services/categoryApi.ts
import { apiFetch } from '../utils/apiFetch';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isMain: boolean;
  parent?: string;
  parentCategory?: string; // For backward compatibility
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  categories?: T[];
  category?: T;
  message?: string;
}

/**
 * List all categories
 */
export interface ListCategoriesOptions {
  isMain?: boolean;
  isActive?: boolean;
  all?: boolean; // If true, returns all categories regardless of isActive status
}

export async function listCategories(options?: ListCategoriesOptions): Promise<Category[]> {
  const queryParams = new URLSearchParams();
  if (options?.isMain !== undefined) {
    queryParams.append('isMain', options.isMain.toString());
  }
  if (options?.isActive !== undefined) {
    queryParams.append('isActive', options.isActive.toString());
  }
  if (options?.all !== undefined) {
    queryParams.append('all', options.all.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiFetch<ApiResponse<Category>>(endpoint);

  if (!response.success || !response.categories) {
    throw new Error(response.message || 'Failed to fetch categories');
  }

  return response.categories;
}

/**
 * Get main categories only (for mainCategory dropdown)
 */
export async function getMainCategories(): Promise<Category[]> {
  const categories = await listCategories({ isMain: true, isActive: true });
  return categories;
}

/**
 * Get sub categories for a main category
 */
export async function getSubCategories(mainCategoryId: string): Promise<Category[]> {
  const categories = await listCategories({ isMain: false, isActive: true });
  return categories.filter(
    (cat) => cat.parent === mainCategoryId || cat.parentCategory === mainCategoryId
  );
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiFetch<ApiResponse<Category>>(`/categories/${slug}`);

  if (!response.success || !response.category) {
    throw new Error(response.message || 'Failed to fetch category');
  }

  return response.category;
}

/**
 * Get category by ID (from list, then find by ID)
 * Searches both active and inactive categories
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const allCategories = await listCategories({ all: true });
  return allCategories.find((cat) => cat._id === id) || null;
}

/**
 * Create a new category (with file upload support)
 */
export interface CreateCategoryData {
  name: string;
  description: string;
  image?: string;
  isMain: boolean;
  parent?: string;
  isActive?: boolean;
}

export async function createCategoryWithFile(formData: FormData): Promise<Category> {
  const token = localStorage.getItem('accessToken');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || 'Request failed');
  }

  const data = await response.json();
  if (!data.success || !data.category) {
    throw new Error(data.message || 'Failed to create category');
  }

  return data.category;
}

/**
 * Create a new category (URL only)
 */
export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const response = await apiFetch<ApiResponse<Category>>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.category) {
    throw new Error(response.message || 'Failed to create category');
  }

  return response.category;
}

/**
 * Update a category (with file upload support)
 */
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export async function updateCategoryWithFile(id: string, formData: FormData): Promise<Category> {
  const token = localStorage.getItem('accessToken');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || 'Request failed');
  }

  const data = await response.json();
  if (!data.success || !data.category) {
    throw new Error(data.message || 'Failed to update category');
  }

  return data.category;
}

/**
 * Update a category (URL only)
 */
export async function updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
  const response = await apiFetch<ApiResponse<Category>>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.category) {
    throw new Error(response.message || 'Failed to update category');
  }

  return response.category;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiFetch(`/categories/${id}`, {
    method: 'DELETE',
  });
}

