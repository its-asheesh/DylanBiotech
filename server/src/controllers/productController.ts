// src/controllers/productController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as productService from '../services/ProductService';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

// Helper: Parse query params safely
const parseNumber = (val: any, fallback: number) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : num;
};

// Helper: Upload multiple files to Cloudinary
const uploadFilesToCloudinary = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, folder));
  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.secure_url);
};

// 🔐 CREATE Product (Admin only)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const productData = { ...req.body };

  // Upload main image if provided
  if (files?.image && files.image[0]) {
    const result = await uploadToCloudinary(files.image[0].buffer, 'products');
    productData.image = result.secure_url;
  }

  // Handle additional images - files take priority, then URLs
  const imageUrls: string[] = [];
  
  // Upload image files if provided
  if (files?.images && files.images.length > 0) {
    const uploadedImages = await uploadFilesToCloudinary(files.images, 'products');
    imageUrls.push(...uploadedImages);
  }

  // Add URL images if provided (for backward compatibility or when files aren't used)
  if (req.body.images && typeof req.body.images === 'string') {
    try {
      const urlImages = JSON.parse(req.body.images);
      if (Array.isArray(urlImages)) {
        imageUrls.push(...urlImages);
      } else {
        imageUrls.push(urlImages);
      }
    } catch {
      // If not JSON, treat as single URL
      if (req.body.images.trim()) {
        imageUrls.push(req.body.images);
      }
    }
  }

  if (imageUrls.length > 0) {
    productData.images = imageUrls;
  }

  const product = await productService.createProduct(productData);
  res.status(201).json({ success: true, product });
});

// 🌐 LIST Products (Public/Admin)
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, category, brand, featured, search, ...rest } = req.query;
  
  // Check if user is admin (from auth middleware)
  const isAdmin = (req as any).user?.role === 'admin';

  const filters = {
    ...rest,
    ...(brand && { brand: { $regex: brand, $options: 'i' } }),
    ...(featured !== undefined && { featured: featured === 'true' }),
    ...(search && { search: search as string }),
    category: category as string | undefined,
  };

  const result = await productService.listProducts(
    filters,
    parseNumber(page, 1),
    parseNumber(limit, 10),
    isAdmin
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
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const productData = { ...req.body };

  // Upload main image if provided
  if (files?.image && files.image[0]) {
    const result = await uploadToCloudinary(files.image[0].buffer, 'products');
    productData.image = result.secure_url;
  }

  // Upload additional images if provided
  if (files?.images && files.images.length > 0) {
    const additionalImages = await uploadFilesToCloudinary(files.images, 'products');
    // Merge with existing images if provided in body
    if (req.body.images && typeof req.body.images === 'string') {
      try {
        const existingImages = JSON.parse(req.body.images);
        productData.images = [...existingImages, ...additionalImages];
      } catch {
        productData.images = [req.body.images, ...additionalImages];
      }
    } else {
      productData.images = additionalImages;
    }
  }

  const product = await productService.updateProduct(req.params.id, productData);
  res.json({ success: true, product });
});

// 🔐 DELETE Product (Admin only)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).send();
});

// 🔐 CREATE Variant (Admin only)
export const createVariant = asyncHandler(async (req: Request, res: Response) => {
  const variantData = { ...req.body };

  // Upload variant image if provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'products/variants');
    variantData.image = result.secure_url;
  }

  const variant = await productService.createVariant(variantData);
  res.status(201).json({ success: true, variant });
});

// 🌐 GET Variants by Product ID (Public)
export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  const variants = await productService.getVariantsByProduct(req.params.productId);
  res.json({ success: true, variants });
});