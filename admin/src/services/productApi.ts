// src/services/productApi.ts
import { apiFetch } from '../utils/apiFetch';

export interface CategoryRef {
  _id: string;
  name: string;
  slug?: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  mainCategory: string | CategoryRef;
  subCategory?: string | CategoryRef;
  tagCategories: string[] | Array<{ _id: string; name: string; color?: string; icon?: string }>;
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
 * Create a new product (with file upload support)
 */
export async function createProductWithFiles(formData: FormData): Promise<Product> {
  const token = localStorage.getItem('accessToken');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData - browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}/products`, {
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
  if (!data.success || !data.product) {
    throw new Error(data.message || 'Failed to create product');
  }

  return data.product;
}

/**
 * Create a new product (legacy - URL only)
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
  search?: string;
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
  if (params.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

  return await apiFetch<ListProductsResponse>(endpoint);
}

// ===== Product Variants =====

export interface ProductVariant {
  _id: string;
  product: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantData {
  product: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
  image?: string;
  isActive?: boolean;
}

export interface VariantApiResponse<T> {
  success: boolean;
  variant?: T;
  variants?: T[];
  message?: string;
}

/**
 * Create a product variant (with file upload support)
 */
export async function createVariantWithFiles(formData: FormData): Promise<ProductVariant> {
  const token = localStorage.getItem('accessToken');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/products/variants`, {
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
  if (!data.success || !data.variant) {
    throw new Error(data.message || 'Failed to create variant');
  }

  return data.variant;
}

/**
 * Create a product variant (legacy - URL only)
 */
export async function createVariant(data: CreateVariantData): Promise<ProductVariant> {
  const response = await apiFetch<VariantApiResponse<ProductVariant>>('/products/variants', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.variant) {
    throw new Error(response.message || 'Failed to create variant');
  }

  return response.variant;
}

/**
 * Get all variants for a product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const response = await apiFetch<VariantApiResponse<ProductVariant>>(`/products/${productId}/variants`);

  if (!response.success || !response.variants) {
    throw new Error(response.message || 'Failed to fetch variants');
  }

  return response.variants;
}

