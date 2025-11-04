// src/services/productService.ts
import ProductModel, { IProduct } from '../models/ProductModel';
import ProductVariantModel, { IProductVariant } from '../models/ProductVariant';
import { ApiError } from '../utils/apiError';

// Create Product
export const createProduct = async (data: Partial<IProduct>): Promise<IProduct> => {
  const product = new ProductModel(data);
  return await product.save();
};

// Get Product by ID (with variants & categories)
export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await ProductModel.findById(id)
    .populate('mainCategory', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('tagCategories', 'name slug color icon')
    .lean();

  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

// List Products (public, with filters & pagination)
export const listProducts = async (
  filters: Record<string, any> = {},
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;
  const query: any = { isActive: true };

  if (filters.category) {
    query.$or = [
      { mainCategory: filters.category },
      { subCategory: filters.category }
    ];
    delete filters.category;
  }

  Object.assign(query, filters);

  const products = await ProductModel.find(query)
    .populate('mainCategory', 'name')
    .populate('subCategory', 'name')
    .populate('tagCategories', 'name color')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await ProductModel.countDocuments(query);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Update Product
export const updateProduct = async (
  id: string,
  data: Partial<IProduct>
): Promise<IProduct> => {
  const product = await ProductModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

// Delete Product
export const deleteProduct = async (id: string): Promise<void> => {
  const product = await ProductModel.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, 'Product not found');
};

// === Variants ===

export const createVariant = async (data: Partial<IProductVariant>): Promise<IProductVariant> => {
  const variant = new ProductVariantModel(data);
  return await variant.save();
};

export const getVariantsByProduct = async (productId: string) => {
  return await ProductVariantModel.find({ product: productId, isActive: true }).lean();
};