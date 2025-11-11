// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as categoryService from '../services/CategoryService';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  let imageUrl = req.body.image;

  // Upload image if provided as buffer (from multer)
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'categories');
    imageUrl = result.secure_url;
  }

  const categoryData = {
    ...req.body,
    image: imageUrl,
  };

  const category = await categoryService.createCategory(categoryData);
  res.status(201).json({ success: true,  category });
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const isMain = req.query.isMain === 'true' ? true : req.query.isMain === 'false' ? false : undefined;
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const all = req.query.all === 'true' ? true : undefined;
  const categories = await categoryService.getAllCategories(isMain, isActive, all);
  res.json({ success: true, categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res.json({ success: true,  category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  let imageUrl = req.body.image;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'categories');
    imageUrl = result.secure_url;
  }

  const updateData = { ...req.body, image: imageUrl };
  const category = await categoryService.updateCategory(req.params.id, updateData);
  res.json({ success: true,  category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).send();
});