import { Request, Response, NextFunction } from 'express';
import Category, { ICategory } from '../models/CategoryModel';
import asyncHandler from '../middleware/asyncHandler';

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Admin
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find({}).sort({ isMain: -1, name: 1 });
  res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Admin
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Admin
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, isMain, parent } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const level = isMain ? 0 : parent ? 1 : 0;

  const category = new Category({
    name,
    description,
    image,
    isMain,
    parent: isMain ? null : parent,
    level
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Admin
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, isMain, parent, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (name && name !== category.name) {
    const exists = await Category.findOne({ name });
    if (exists && exists._id.toString() !== req.params.id) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.image = image || category.image;
  category.isMain = isMain ?? category.isMain;
  category.parent = isMain ? null : parent || category.parent;
  category.level = isMain ? 0 : category.parent ? 1 : 0;
  category.isActive = isActive ?? category.isActive;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Admin
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Optional: Check if products exist — prevent deletion if so
  // const productCount = await Product.countDocuments({ $or: [{ mainCategory: category._id }, { subCategory: category._id }] });
  // if (productCount > 0) {
  //   res.status(400);
  //   throw new Error('Cannot delete category with associated products');
  // }

  await category.deleteOne();
  res.json({ message: 'Category removed' });
});