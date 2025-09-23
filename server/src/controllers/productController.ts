import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import asyncHandler from '../middleware/asyncHandler';

const productService = new ProductService();

// @desc    Get paginated products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { keyword, category, subcategory, tag, page = 1, limit = 10 } = req.query;

  const filters = {
    mainCategory: category as string | undefined,
    subCategory: subcategory as string | undefined,
    tagCategories: tag ? [tag as string] : undefined,
    search: keyword as string | undefined
  };

  const result = await productService.getProductsPaginated(
    Number(page),
    Number(limit),
    filters
  );

  res.json({
    products: result.products,
    page: Number(page),
    pages: result.pages,
    total: result.total
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Admin (protected by route middleware)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const success = await productService.deleteProduct(req.params.id);
  
  if (!success) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ message: 'Product removed' });
});