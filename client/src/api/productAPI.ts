import axios from 'axios';
import type { Product } from '../types/product.d.ts';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get('/api/products');
    return response.data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; // Return empty array on error
  }
};
