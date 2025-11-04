// src/services/tagCategoryService.ts
import TagCategory,{ ITagCategory } from '../models/TagCategory';
import { ApiError } from '../utils/apiError';

export const createTag = async ( data: Partial<ITagCategory>): Promise<ITagCategory> => {
  const tag = new TagCategory(data);
  return await tag.save();
};

export const getAllTags = async () => {
  return await TagCategory.find({ isActive: true }).lean();
};

export const getTagBySlug = async (slug: string) => {
  const tag = await TagCategory.findOne({ slug, isActive: true }).lean();
  if (!tag) throw new ApiError(404, 'Tag not found');
  return tag;
};

export const updateTag = async (id: string, data: Partial<ITagCategory>) => {
  const tag = await TagCategory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!tag) throw new ApiError(404, 'Tag not found');
  return tag;
};

export const deleteTag = async (id: string) => {
  const tag = await TagCategory.findByIdAndDelete(id);
  if (!tag) throw new ApiError(404, 'Tag not found');
};