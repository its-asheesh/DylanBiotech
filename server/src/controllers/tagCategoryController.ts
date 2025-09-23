import { Request, Response, NextFunction } from 'express';
import { TagCategoryService } from '../services/TagCategoryService';
import asyncHandler from '../middleware/asyncHandler';

const tagService = new TagCategoryService();

// @desc    Get all tag categories
// @route   GET /api/admin/tags
// @access  Admin
export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const tags = await tagService.getAllTags(includeInactive);
  res.json(tags);
});

// @desc    Get tag by ID
// @route   GET /api/admin/tags/:id
// @access  Admin
export const getTagById = asyncHandler(async (req: Request, res: Response) => {
  const tag = await tagService.getTagById(req.params.id);
  if (!tag) {
    res.status(404);
    throw new Error('Tag not found');
  }
  res.json(tag);
});

// @desc    Create new tag category
// @route   POST /api/admin/tags
// @access  Admin
export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const tag = await tagService.createTag(req.body);
  res.status(201).json(tag);
});

// @desc    Update tag category
// @route   PUT /api/admin/tags/:id
// @access  Admin
export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const tag = await tagService.updateTag(req.params.id, req.body);
  if (!tag) {
    res.status(404);
    throw new Error('Tag not found');
  }
  res.json(tag);
});

// @desc    Delete tag category
// @route   DELETE /api/admin/tags/:id
// @access  Admin
export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const success = await tagService.deleteTag(req.params.id);
  if (!success) {
    res.status(404);
    throw new Error('Tag not found');
  }
  res.json({ message: 'Tag removed' });
});

// @desc    Get tags with product count
// @route   GET /api/admin/tags/with-count
// @access  Admin
export const getTagsWithProductCount = asyncHandler(async (req: Request, res: Response) => {
  const tags = await tagService.getTagsWithProductCount();
  res.json(tags);
});

// @desc    Search tags
// @route   GET /api/admin/tags/search
// @access  Admin
export const searchTags = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    res.status(400);
    throw new Error('Search query required');
  }
  const tags = await tagService.searchTags(q);
  res.json(tags);
});