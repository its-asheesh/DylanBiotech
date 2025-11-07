// src/services/productApi.ts
import { apiFetch } from '../utils/apiFetch';

export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  mainCategory: string;
  subCategory?: string;
  tagCategories: string[];
  stock: number;
  image: string;
  images?: string[];
  isActive: boolean;
  featured: boolean;
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  brand: string;
  description: string;
  price: number;
  mainCategory: string;
  subCategory?: string;
  tagCategories?: string[];
  stock?: number;
  image: string;
  images?: string[];
  isActive?: boolean;
  featured?: boolean;
  rating?: number;
  reviews?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  product?: T;
  message?: string;
}

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductData): Promise<Product> {
  const response = await apiFetch<ApiResponse<Product>>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.product) {
    throw new Error(response.message || 'Failed to create product');
  }

  return response.product;
}

/**
 * Get a product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const response = await apiFetch<ApiResponse<Product>>(`/products/${id}`);

  if (!response.success || !response.product) {
    throw new Error(response.message || 'Failed to fetch product');
  }

  return response.product;
}

/**
 * Update a product
 */
export async function updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
  const response = await apiFetch<ApiResponse<Product>>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.product) {
    throw new Error(response.message || 'Failed to update product');
  }

  return response.product;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/products/${id}`, {
    method: 'DELETE',
  });
}

/**
 * List products with filters
 */
export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  featured?: boolean;
}

export interface ListProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function listProducts(params: ListProductsParams = {}): Promise<ListProductsResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());

  const queryString = queryParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

  return await apiFetch<ListProductsResponse>(endpoint);
}

