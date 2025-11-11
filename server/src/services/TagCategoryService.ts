// src/services/tagCategoryService.ts
import TagCategory,{ ITagCategory } from '../models/TagCategory';
import { ApiError } from '../utils/apiError';

export const createTag = async ( data: Partial<ITagCategory>): Promise<ITagCategory> => {
  const tag = new TagCategory(data);
  return await tag.save();
};

export const getAllTags = async (isActive?: boolean, all?: boolean) => {
  const query: any = {};
  // If 'all' is true, don't filter by isActive (return all)
  // Otherwise, if isActive is not provided, default to true (active only) for backward compatibility
  if (all) {
    // Don't add isActive filter - return all tags
  } else if (isActive !== undefined) {
    query.isActive = isActive;
  } else {
    query.isActive = true;
  }

  return await TagCategory.find(query).sort({ name: 1 }).lean();
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