// src/validations/userValidations.ts
import { z } from 'zod';

// MongoDB ObjectId validation - Strict 24 hex characters
const objectIdSchema = z
  .string()
  .length(24, 'User ID must be exactly 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format. Must be a valid MongoDB ObjectId');

// Email validation - Enhanced
const emailSchema = z
  .string()
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email is too long (max 254 characters)')
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .refine((email) => !email.includes('..'), 'Email cannot contain consecutive dots')
  .refine((email) => !email.startsWith('.') && !email.endsWith('.'), 'Email cannot start or end with a dot')
  .refine((email) => email.split('@').length === 2, 'Email must contain exactly one @ symbol')
  .optional();

// Name validation - Enhanced
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name cannot exceed 100 characters')
  .trim()
  .refine((name) => name.length > 0, 'Name cannot be empty')
  .refine((name) => name.trim().length > 0, 'Name cannot be only whitespace')
  .refine((name) => /^[a-zA-Z\s'-]+$/.test(name), 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Phone validation - Enhanced E.164 format
const phoneSchema = z
  .union([
    z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +1234567890)')
      .min(8, 'Phone number is too short')
      .max(16, 'Phone number is too long'),
    z.literal(''),
  ])
  .optional();

// Password validation - Enhanced with special character requirement
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')
  .refine((password) => !password.includes(' '), 'Password cannot contain spaces');

// User validations
export const updateProfileSchema = {
  body: z.object({
    name: nameSchema.optional(),
    email: emailSchema,
    phone: phoneSchema,
  }),
};

export const changePasswordSchema = {
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    }),
};

export const deleteAccountSchema = {
  body: z.object({
    password: z.string().min(1, 'Password is required to delete your account'),
  }),
};

// Admin user management validations
export const listUsersSchema = {
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine((n) => n > 0, 'Page must be greater than 0')
      .optional()
      .default(() => 1),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((n) => n >= 1 && n <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default(() => 10),
    role: z.enum(['user', 'admin']).optional(),
    search: z
      .string()
      .min(1, 'Search term cannot be empty')
      .max(200, 'Search term cannot exceed 200 characters')
      .trim()
      .refine((term) => term.length > 0, 'Search term cannot be only whitespace')
      .optional(),
    includeDeleted: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    onlyDeleted: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    createdFrom: z
      .string()
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val.length >= 10;
      }, 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01 or 2024-01-01T00:00:00Z)')
      .refine((val) => {
        const date = new Date(val);
        return date <= new Date(); // Cannot be in the future
      }, 'Created date cannot be in the future')
      .optional(),
    createdTo: z
      .string()
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val.length >= 10;
      }, 'Invalid date format. Use ISO 8601 format (e.g., 2024-12-31 or 2024-12-31T23:59:59Z)')
      .refine((val) => {
        const date = new Date(val);
        return date <= new Date(); // Cannot be in the future
      }, 'Created date cannot be in the future')
      .optional(),
    hasPhone: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    sortBy: z.enum(['name', 'email', 'createdAt', 'role', 'deletedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export const getUserByIdSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const updateUserRoleSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    role: z.enum(['user', 'admin'], {
      message: 'Role must be either "user" or "admin"',
    }),
    adminLevel: z.number().min(1).max(3).optional(),
  }),
};

export const deleteUserSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    hardDelete: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
};

export const restoreUserSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

