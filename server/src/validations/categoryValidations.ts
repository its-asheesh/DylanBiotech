// src/validations/categoryValidations.ts
import { z } from 'zod';

// MongoDB ObjectId validation - Strict
const objectIdSchema = z
  .string()
  .length(24, 'ID must be exactly 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format. Must be a valid MongoDB ObjectId');

// Category name validation
const categoryNameSchema = z
  .string()
  .min(1, 'Category name is required')
  .max(100, 'Category name cannot exceed 100 characters')
  .trim()
  .refine((name) => name.length > 0, 'Category name cannot be empty')
  .refine((name) => !name.startsWith(' ') && !name.endsWith(' '), 'Category name cannot start or end with spaces');

// Category description validation
const categoryDescriptionSchema = z
  .string()
  .min(10, 'Description must be at least 10 characters')
  .max(500, 'Description cannot exceed 500 characters')
  .trim()
  .refine((desc) => desc.length >= 10, 'Description is too short');

// Image URL validation
const imageUrlSchema = z
  .string()
  .url('Invalid image URL format')
  .max(2048, 'Image URL is too long (max 2048 characters)')
  .refine(
    (url) => /^https?:\/\//.test(url),
    'Image URL must use http:// or https:// protocol'
  )
  .optional();

// Slug validation
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug cannot exceed 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with a hyphen');

// Category validations
export const createCategorySchema = {
  body: z
    .object({
      name: categoryNameSchema,
      description: categoryDescriptionSchema,
      image: imageUrlSchema,
      isMain: z.boolean().optional().default(false),
      parent: objectIdSchema.optional(),
      isActive: z.boolean().optional().default(true),
    })
    .refine((data) => {
      // If it's a main category, it cannot have a parent
      if (data.isMain && data.parent) {
        return false;
      }
      return true;
    }, {
      message: 'Main categories cannot have a parent',
      path: ['parent'],
    })
    .refine((data) => {
      // If it's not a main category, it must have a parent
      if (!data.isMain && !data.parent) {
        return false;
      }
      return true;
    }, {
      message: 'Sub categories must have a parent category',
      path: ['parent'],
    }),
};

export const updateCategorySchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: categoryNameSchema.optional(),
    description: categoryDescriptionSchema.optional(),
    image: imageUrlSchema,
    isActive: z.boolean().optional(),
    // Note: isMain and parent should not be changed after creation
  }),
};

export const getCategorySchema = {
  params: z.object({
    slug: slugSchema,
  }),
};

export const deleteCategorySchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const listCategoriesSchema = {
  query: z.object({
    isMain: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
};

