// src/validations/tagCategoryValidations.ts
import { z } from 'zod';

// MongoDB ObjectId validation - Strict
const objectIdSchema = z
  .string()
  .length(24, 'ID must be exactly 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format. Must be a valid MongoDB ObjectId');

// Tag name validation
const tagNameSchema = z
  .string()
  .min(1, 'Tag name is required')
  .max(50, 'Tag name cannot exceed 50 characters')
  .trim()
  .refine((name) => name.length > 0, 'Tag name cannot be empty')
  .refine((name) => /^[a-zA-Z0-9\s-]+$/.test(name), 'Tag name can only contain letters, numbers, spaces, and hyphens');

// Description validation
const tagDescriptionSchema = z
  .string()
  .max(200, 'Description cannot exceed 200 characters')
  .trim()
  .optional();

// Color validation - Hex color code
const colorSchema = z
  .string()
  .max(50, 'Color value cannot exceed 50 characters')
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/, 'Color must be a valid hex code (e.g., #FF5733) or color name')
  .optional();

// Icon URL validation
const iconUrlSchema = z
  .string()
  .url('Invalid icon URL format')
  .max(2048, 'Icon URL is too long (max 2048 characters)')
  .refine(
    (url) => /^https?:\/\//.test(url),
    'Icon URL must use http:// or https:// protocol'
  )
  .optional();

// Slug validation
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug cannot exceed 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with a hyphen');

// Tag Category validations
export const createTagSchema = {
  body: z.object({
    name: tagNameSchema,
    description: tagDescriptionSchema,
    color: colorSchema,
    icon: iconUrlSchema,
    isActive: z.boolean().optional().default(true),
  }),
};

export const updateTagSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: tagNameSchema.optional(),
    description: tagDescriptionSchema,
    color: colorSchema,
    icon: iconUrlSchema,
    isActive: z.boolean().optional(),
  }),
};

export const getTagSchema = {
  params: z.object({
    slug: slugSchema,
  }),
};

export const deleteTagSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

