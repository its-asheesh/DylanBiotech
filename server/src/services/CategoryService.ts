// src/services/categoryService.ts
import Category, { ICategory } from '../models/CategoryModel';
import { ApiError } from '../utils/apiError';

export const createCategory = async ( data : Partial<ICategory>): Promise<ICategory> => {
  // Ensure consistency: if parent is provided, it must be a main category
  if (data.parent) {
    const parentCat = await Category.findById(data.parent);
    if (!parentCat) throw new ApiError(404, 'Parent category not found');
    if (!parentCat.isMain) throw new ApiError(400, 'Parent must be a main category');
    data.isMain = false;
    data.level = 1;
  } else {
    data.isMain = true;
    data.level = 0;
    data.parent = undefined;
  }

  const category = new Category(data);
  return await category.save();
};

export const getAllCategories = async (isMain?: boolean) => {
  const query: any = { isActive: true };
  if (isMain !== undefined) query.isMain = isMain;

  return await Category.find(query)
    .populate('parent', 'name')
    .sort({ name: 1 })
    .lean();
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({ slug, isActive: true })
    .populate('parent', 'name slug')
    .lean();
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
};

export const updateCategory = async (id: string, data: Partial<ICategory>) => {
  // Prevent changing isMain after creation
  if (data.isMain !== undefined) {
    const existing = await Category.findById(id);
    if (existing && existing.isMain !== data.isMain) {
      throw new ApiError(400, 'Cannot change category type after creation');
    }
  }

  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!category) throw new ApiError(404, 'Category not found');
  return category;
};

export const deleteCategory = async (id: string) => {
  // Optional: check if products exist → soft delete instead
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(404, 'Category not found');
};