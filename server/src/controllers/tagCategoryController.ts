// src/controllers/tagCategoryController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as tagService from '../services/TagCategoryService';
import { uploadToCloudinary } from '../middleware/uploadMiddleware';

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  let iconUrl = req.body.icon;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'tags');
    iconUrl = result.secure_url;
  }

  const tagData = { ...req.body, icon: iconUrl };
  const tag = await tagService.createTag(tagData);
  res.status(201).json({ success: true,  tag });
});

export const listTags = asyncHandler(async (req: Request, res: Response) => {
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const all = req.query.all === 'true' ? true : undefined;
  const tags = await tagService.getAllTags(isActive, all);
  res.json({ success: true, tags });
});

export const getTag = asyncHandler(async (req: Request, res: Response) => {
  const tag = await tagService.getTagBySlug(req.params.slug);
  res.json({ success: true,  tag });
});

export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  let iconUrl = req.body.icon;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'tags');
    iconUrl = result.secure_url;
  }
  const tag = await tagService.updateTag(req.params.id, { ...req.body, icon: iconUrl });
  res.json({ success: true,  tag });
});

export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  await tagService.deleteTag(req.params.id);
  res.status(204).send();
});