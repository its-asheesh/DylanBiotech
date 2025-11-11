// src/services/tagCategoryApi.ts
import { apiFetch } from '../utils/apiFetch';

export interface TagCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  productCount?: number;
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
export interface ListTagCategoriesOptions {
  isActive?: boolean;
  all?: boolean; // If true, returns all tags regardless of isActive status
}

export async function listTagCategories(options?: ListTagCategoriesOptions): Promise<TagCategory[]> {
  const queryParams = new URLSearchParams();
  if (options?.isActive !== undefined) {
    queryParams.append('isActive', options.isActive.toString());
  }
  if (options?.all !== undefined) {
    queryParams.append('all', options.all.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/tag-categories${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiFetch<ApiResponse<TagCategory>>(endpoint);

  if (!response.success || !response.tags) {
    throw new Error(response.message || 'Failed to fetch tag categories');
  }

  return response.tags;
}

/**
 * Get active tag categories only
 */
export async function getActiveTagCategories(): Promise<TagCategory[]> {
  return await listTagCategories({ isActive: true });
}

/**
 * Get tag category by slug
 */
export async function getTagCategoryBySlug(slug: string): Promise<TagCategory> {
  const response = await apiFetch<ApiResponse<TagCategory>>(`/tag-categories/${slug}`);

  if (!response.success || !response.tag) {
    throw new Error(response.message || 'Failed to fetch tag category');
  }

  return response.tag;
}

/**
 * Get tag category by ID (from list, then find by ID)
 * Searches both active and inactive tags
 */
export async function getTagCategoryById(id: string): Promise<TagCategory | null> {
  const allTags = await listTagCategories({ all: true });
  return allTags.find((tag) => tag._id === id) || null;
}

/**
 * Create a new tag category (with file upload support)
 */
export interface CreateTagCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export async function createTagCategoryWithFile(formData: FormData): Promise<TagCategory> {
  const token = localStorage.getItem('accessToken');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/tag-categories`, {
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
  if (!data.success || !data.tag) {
    throw new Error(data.message || 'Failed to create tag category');
  }

  return data.tag;
}

/**
 * Create a new tag category (URL only)
 */
export async function createTagCategory(data: CreateTagCategoryData): Promise<TagCategory> {
  const response = await apiFetch<ApiResponse<TagCategory>>('/tag-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.tag) {
    throw new Error(response.message || 'Failed to create tag category');
  }

  return response.tag;
}

/**
 * Update a tag category (with file upload support)
 */
export interface UpdateTagCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export async function updateTagCategoryWithFile(id: string, formData: FormData): Promise<TagCategory> {
  const token = localStorage.getItem('accessToken');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/tag-categories/${id}`, {
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
  if (!data.success || !data.tag) {
    throw new Error(data.message || 'Failed to update tag category');
  }

  return data.tag;
}

/**
 * Update a tag category (URL only)
 */
export async function updateTagCategory(id: string, data: UpdateTagCategoryData): Promise<TagCategory> {
  const response = await apiFetch<ApiResponse<TagCategory>>(`/tag-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.tag) {
    throw new Error(response.message || 'Failed to update tag category');
  }

  return response.tag;
}

/**
 * Delete a tag category
 */
export async function deleteTagCategory(id: string): Promise<void> {
  await apiFetch(`/tag-categories/${id}`, {
    method: 'DELETE',
  });
}

