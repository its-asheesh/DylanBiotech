// src/middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import asyncHandler from './asyncHandler';

/**
 * Middleware to validate request body, query, or params using Zod schema
 * Schema structure: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }
 */
export const validate = (schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate query - store validated result in a custom property
      if (schema.query) {
        const validatedQuery = await schema.query.parseAsync(req.query);
        // Merge validated query back into req.query using Object.assign
        Object.assign(req.query, validatedQuery);
      }

      // Validate params - store validated result in a custom property
      if (schema.params) {
        const validatedParams = await schema.params.parseAsync(req.params);
        // Merge validated params back into req.params using Object.assign
        Object.assign(req.params, validatedParams);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400);
        const errorMessages = error.issues.map((err) => {
          const path = err.path.map(String).join('.');
          return path ? `${path}: ${err.message}` : err.message;
        });
        throw new Error(errorMessages.join(', '));
      }
      throw error;
    }
  });
};

/**
 * Sanitize string input to prevent injection attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      // Use Object.prototype.hasOwnProperty.call for safer property checking
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

/**
 * Middleware to sanitize request body
 */
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    const sanitizedQuery = sanitizeObject(req.query);
    Object.assign(req.query, sanitizedQuery);
  }
  if (req.params) {
    const sanitizedParams = sanitizeObject(req.params);
    Object.assign(req.params, sanitizedParams);
  }
  next();
};

