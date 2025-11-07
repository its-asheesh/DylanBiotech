// src/validations/authValidations.ts
import { z } from 'zod';

// Email validation - RFC 5322 compliant with max length
const emailSchema = z
  .string()
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email is too long (max 254 characters)')
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .refine((email) => !email.includes('..'), 'Email cannot contain consecutive dots')
  .refine((email) => !email.startsWith('.') && !email.endsWith('.'), 'Email cannot start or end with a dot')
  .refine((email) => email.split('@').length === 2, 'Email must contain exactly one @ symbol');

// Password validation - Enhanced security requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')
  .refine(
    (password) => !password.includes(' '),
    'Password cannot contain spaces'
  )
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    'Password cannot contain the same character repeated more than twice consecutively'
  )
  .refine(
    (password) => {
      const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
      return !commonPasswords.some((common) => password.toLowerCase().includes(common));
    },
    'Password is too common. Please choose a stronger password'
  );

// Name validation - Enhanced with whitespace check
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name cannot exceed 100 characters')
  .trim()
  .refine((name) => name.length > 0, 'Name cannot be empty')
  .refine((name) => name.trim().length > 0, 'Name cannot be only whitespace')
  .refine((name) => /^[a-zA-Z\s'-]+$/.test(name), 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .refine((name) => !name.includes('  '), 'Name cannot contain consecutive spaces');

// Phone validation - Enhanced with E.164 format validation
const phoneSchema = z
  .union([
    z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +1234567890)')
      .min(8, 'Phone number is too short')
      .max(16, 'Phone number is too long'),
    z.literal(''),
  ])
  .optional()
  .refine((val) => !val || val === '' || val.startsWith('+'), 'Phone number must start with + and country code');

// OTP validation - 6 digits, no spaces
const otpSchema = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
  .refine((otp) => !otp.includes(' '), 'OTP cannot contain spaces');

// JWT Token validation - Basic format check
const jwtTokenSchema = z
  .string()
  .min(10, 'Token is too short')
  .max(2048, 'Token is too long')
  .refine(
    (token) => token.split('.').length === 3,
    'Invalid token format. Expected JWT format (header.payload.signature)'
  );

// Auth validations
export const registerSchema = {
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
};

export const loginSchema = {
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
};

export const googleAuthSchema = {
  body: z.object({
    idToken: jwtTokenSchema,
  }),
};

export const sendOtpSchema = {
  body: z.object({
    email: emailSchema,
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
    password: passwordSchema.optional(),
  }),
};

export const checkEmailSchema = {
  query: z.object({
    email: emailSchema,
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
  }),
};

export const firebasePhoneLoginSchema = {
  body: z.object({
    idToken: jwtTokenSchema,
    phone: phoneSchema,
  }),
};

