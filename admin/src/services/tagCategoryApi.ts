// src/services/tagCategoryApi.ts
import { apiFetch } from '../utils/apiFetch';

export interface TagCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  tags?: T[];
  tag?: T;
  message?: string;
}

/**
 * List all tag categories
 */
export async function listTagCategories(): Promise<TagCategory[]> {
  const response = await apiFetch<ApiResponse<TagCategory>>('/tag-categories');

  if (!response.success || !response.tags) {
    throw new Error(response.message || 'Failed to fetch tag categories');
  }

  return response.tags;
}

/**
 * Get active tag categories only
 */
export async function getActiveTagCategories(): Promise<TagCategory[]> {
  const tags = await listTagCategories();
  return tags.filter((tag) => tag.isActive);
}

