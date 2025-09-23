import axios from 'axios';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category.d.ts';

const API_BASE_URL = '/api/categories';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getFeaturedCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(`${API_BASE_URL}?featured=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    return [];
  }
};

export const getCategoriesWithCount = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(`${API_BASE_URL}/with-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories with count:', error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const response = await axios.get<Category>(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const response = await axios.get<Category>(`${API_BASE_URL}/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
};

export const searchCategories = async (query: string): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(`${API_BASE_URL}?search=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching categories:', error);
    return [];
  }
};

// Admin functions (require authentication)
export const createCategory = async (categoryData: CreateCategoryInput): Promise<Category | null> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post<Category>(API_BASE_URL, categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, categoryData: UpdateCategoryInput): Promise<Category | null> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put<Category>(`${API_BASE_URL}/${id}`, categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}; 