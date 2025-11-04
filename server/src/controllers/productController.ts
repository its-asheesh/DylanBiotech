// src/controllers/productController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as productService from '../services/ProductService';
import upload from '../middleware/uploadMiddleware'; // your multer setup

// Helper: Parse query params safely
const parseNumber = (val: any, fallback: number) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : num;
};

// 🔐 CREATE Product (Admin only)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true,  product });
});

// 🌐 LIST Products (Public)
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, category, brand, featured, ...rest } = req.query;

  const filters = {
    ...rest,
    ...(brand && { brand: { $regex: brand, $options: 'i' } }),
    ...(featured !== undefined && { featured: featured === 'true' }),
    category: category as string | undefined,
  };

  const result = await productService.listProducts(
    filters,
    parseNumber(page, 1),
    parseNumber(limit, 10)
  );

  res.json({ success: true, ...result });
});

// 🌐 GET Single Product (Public)
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true,  product });
});

// 🔐 UPDATE Product (Admin only)
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true,  product });
});

// 🔐 DELETE Product (Admin only)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).send();
});

// 🔐 CREATE Variant (Admin only)
export const createVariant = asyncHandler(async (req: Request, res: Response) => {
  const variant = await productService.createVariant(req.body);
  res.status(201).json({ success: true,  variant });
});

// 🌐 GET Variants by Product ID (Public)
export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  const variants = await productService.getVariantsByProduct(req.params.productId);
  res.json({ success: true, variants });
});