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
export async function listCategories(): Promise<Category[]> {
  const response = await apiFetch<ApiResponse<Category>>('/categories');

  if (!response.success || !response.categories) {
    throw new Error(response.message || 'Failed to fetch categories');
  }

  return response.categories;
}

/**
 * Get main categories only (for mainCategory dropdown)
 */
export async function getMainCategories(): Promise<Category[]> {
  const categories = await listCategories();
  return categories.filter((cat) => cat.isMain && cat.isActive);
}

/**
 * Get sub categories for a main category
 */
export async function getSubCategories(mainCategoryId: string): Promise<Category[]> {
  const categories = await listCategories();
  return categories.filter(
    (cat) => !cat.isMain && (cat.parent === mainCategoryId || cat.parentCategory === mainCategoryId) && cat.isActive
  );
}

