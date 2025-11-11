// src/validations/productValidations.ts
import { z } from 'zod';

// MongoDB ObjectId validation - Strict
const objectIdSchema = z
  .string()
  .length(24, 'ID must be exactly 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format. Must be a valid MongoDB ObjectId');

// Price validation - Reasonable limits
const priceSchema = z
  .number()
  .min(0, 'Price must be positive')
  .max(1000000, 'Price cannot exceed $1,000,000')
  .refine((price) => Number.isFinite(price), 'Price must be a finite number')
  .refine((price) => !Number.isNaN(price), 'Price cannot be NaN');

// Stock validation - Reasonable limits
const stockSchema = z
  .number()
  .int('Stock must be an integer')
  .min(0, 'Stock cannot be negative')
  .max(1000000, 'Stock cannot exceed 1,000,000');

// Rating validation - 0 to 5 with 1 decimal place
const ratingSchema = z
  .number()
  .min(0, 'Rating must be at least 0')
  .max(5, 'Rating cannot exceed 5')
  .refine((rating) => Number.isFinite(rating), 'Rating must be a finite number')
  .optional();

// URL validation - Enhanced for images
const imageUrlSchema = z
  .string()
  .url('Invalid image URL format')
  .max(2048, 'Image URL is too long (max 2048 characters)')
  .refine(
    (url) => /^https?:\/\//.test(url),
    'Image URL must use http:// or https:// protocol'
  )
  .refine(
    (url) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('cloudinary') || url.includes('data:image'),
    'Image URL must be a valid image format (jpg, png, gif, webp, svg) or Cloudinary URL'
  );

// Product name validation
const productNameSchema = z
  .string()
  .min(1, 'Product name is required')
  .max(200, 'Product name cannot exceed 200 characters')
  .trim()
  .refine((name) => name.length > 0, 'Product name cannot be empty')
  .refine((name) => !name.startsWith(' ') && !name.endsWith(' '), 'Product name cannot start or end with spaces');

// Brand validation
const brandSchema = z
  .string()
  .min(1, 'Brand is required')
  .max(100, 'Brand name cannot exceed 100 characters')
  .trim()
  .refine((brand) => brand.length > 0, 'Brand cannot be empty');

// Description validation
const descriptionSchema = z
  .string()
  .min(10, 'Description must be at least 10 characters')
  .max(5000, 'Description cannot exceed 5000 characters')
  .trim()
  .refine((desc) => desc.length >= 10, 'Description is too short');

// SKU validation
const skuSchema = z
  .string()
  .min(1, 'SKU is required')
  .max(100, 'SKU cannot exceed 100 characters')
  .trim()
  .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores')
  .refine((sku) => sku.length > 0, 'SKU cannot be empty');

// Product validations
export const createProductSchema = {
  body: z
    .object({
      name: productNameSchema,
      brand: brandSchema,
      description: descriptionSchema,
      price: priceSchema,
      mainCategory: objectIdSchema,
      subCategory: objectIdSchema.optional(),
      tagCategories: z
        .array(objectIdSchema)
        .max(20, 'Cannot assign more than 20 tag categories')
        .refine((tags) => new Set(tags).size === tags.length, 'Tag categories must be unique')
        .optional()
        .default([]),
      stock: stockSchema.default(0),
      image: imageUrlSchema.optional(), // Optional if file is uploaded
      images: z
        .array(imageUrlSchema)
        .max(10, 'Cannot have more than 10 images')
        .refine((images) => new Set(images).size === images.length, 'Images must be unique')
        .optional(),
      isActive: z.boolean().optional().default(true),
      featured: z.boolean().optional().default(false),
      rating: ratingSchema,
      reviews: z
        .number()
        .int('Reviews count must be an integer')
        .min(0, 'Reviews count cannot be negative')
        .max(1000000, 'Reviews count is too large')
        .optional(),
    })
    .refine((data) => !data.subCategory || data.subCategory !== data.mainCategory, {
      message: 'Sub category cannot be the same as main category',
      path: ['subCategory'],
    }),
};

export const updateProductSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: productNameSchema.optional(),
      brand: brandSchema.optional(),
      description: descriptionSchema.optional(),
      price: priceSchema.optional(),
      mainCategory: objectIdSchema.optional(),
      subCategory: objectIdSchema.optional(),
      tagCategories: z
        .array(objectIdSchema)
        .max(20, 'Cannot assign more than 20 tag categories')
        .refine((tags) => new Set(tags).size === tags.length, 'Tag categories must be unique')
        .optional(),
      stock: stockSchema.optional(),
      image: imageUrlSchema.optional(),
      images: z
        .array(imageUrlSchema)
        .max(10, 'Cannot have more than 10 images')
        .refine((images) => new Set(images).size === images.length, 'Images must be unique')
        .optional(),
      isActive: z.boolean().optional(),
      featured: z.boolean().optional(),
      rating: ratingSchema,
      reviews: z
        .number()
        .int('Reviews count must be an integer')
        .min(0, 'Reviews count cannot be negative')
        .max(1000000, 'Reviews count is too large')
        .optional(),
    })
    .refine((data) => !data.subCategory || !data.mainCategory || data.subCategory !== data.mainCategory, {
      message: 'Sub category cannot be the same as main category',
      path: ['subCategory'],
    }),
};

export const getProductSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const deleteProductSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const listProductsSchema = {
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n > 0, 'Page must be greater than 0')
      .optional()
      .default(() => 1),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n >= 1 && n <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default(() => 10),
    category: objectIdSchema.optional(),
    brand: z.string().max(100).optional(),
    featured: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
};

export const createVariantSchema = {
  body: z.object({
    product: objectIdSchema,
    name: productNameSchema,
    sku: skuSchema,
    price: priceSchema,
    stock: stockSchema.default(0),
    attributes: z
      .record(z.string(), z.string().max(200, 'Attribute value cannot exceed 200 characters'))
      .refine((attrs) => Object.keys(attrs).length <= 20, 'Cannot have more than 20 attributes')
      .refine((attrs) => Object.keys(attrs).every((key) => key.length <= 50), 'Attribute keys cannot exceed 50 characters')
      .optional()
      .default({}),
    image: imageUrlSchema.optional(),
    isActive: z.boolean().optional().default(true),
  }),
};

export const getVariantsSchema = {
  params: z.object({
    productId: objectIdSchema,
  }),
};

