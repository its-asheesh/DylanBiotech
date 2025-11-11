// src/middleware/permissionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Permission } from '../types/permissions';
import { IUser } from '../models/UserModel';

/**
 * Middleware to check if user has a specific permission
 * Must be used after protect middleware
 */
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401);
      const error = new Error('Not authorized');
      next(error);
      return;
    }

    if (!user.isAdmin()) {
      res.status(403);
      const error = new Error('Not authorized as admin');
      next(error);
      return;
    }

    if (!user.hasPermission(permission)) {
      res.status(403);
      const error = new Error(`Missing required permission: ${permission}`);
      next(error);
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the required permissions
 * Must be used after protect middleware
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401);
      const error = new Error('Not authorized');
      next(error);
      return;
    }

    if (!user.isAdmin()) {
      res.status(403);
      const error = new Error('Not authorized as admin');
      next(error);
      return;
    }

    const hasAny = permissions.some(permission => user.hasPermission(permission));
    
    if (!hasAny) {
      res.status(403);
      const error = new Error(`Missing required permission. Need one of: ${permissions.join(', ')}`);
      next(error);
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has all required permissions
 * Must be used after protect middleware
 */
export const requireAllPermissions = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401);
      const error = new Error('Not authorized');
      next(error);
      return;
    }

    if (!user.isAdmin()) {
      res.status(403);
      const error = new Error('Not authorized as admin');
      next(error);
      return;
    }

    const hasAll = permissions.every(permission => user.hasPermission(permission));
    
    if (!hasAll) {
      res.status(403);
      const error = new Error(`Missing required permissions. Need all of: ${permissions.join(', ')}`);
      next(error);
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is super admin
 * Must be used after protect middleware
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as IUser | undefined;

  if (!user) {
    res.status(401);
    const error = new Error('Not authorized');
    next(error);
    return;
  }

  if (!user.isSuperAdmin()) {
    res.status(403);
    const error = new Error('Super admin access required');
    next(error);
    return;
  }

  next();
};

