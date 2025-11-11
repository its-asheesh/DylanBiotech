// src/controllers/adminPermissionController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AdminPermissionService } from '../services/AdminPermissionService';
import { AdminLevel, Permission } from '../types/permissions';

const adminPermissionService = new AdminPermissionService();

/**
 * @desc    List all admins (Super admin only)
 * @route   GET /api/admin/admins
 * @access  Private/Super Admin
 */
export const listAdmins = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const adminLevel = req.query.adminLevel ? Number(req.query.adminLevel) : undefined;
      const search = req.query.search as string | undefined;
      const includeDeleted = req.query.includeDeleted === 'true';

      const result = await adminPermissionService.listAdmins(
        {
          adminLevel,
          search,
          includeDeleted,
        },
        page,
        limit
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Error in listAdmins:', error);
      res.status(500);
      throw new Error(error.message || 'Failed to list admins');
    }
  }
);

/**
 * @desc    Get admin by ID (Super admin only)
 * @route   GET /api/admin/admins/:id
 * @access  Private/Super Admin
 */
export const getAdminById = asyncHandler(
  async (req: Request, res: Response) => {
    const adminId = req.params.id;
    const admin = await adminPermissionService.getAdminById(adminId);

    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    res.json({
      success: true,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        adminLevel: admin.adminLevel,
        permissions: admin.permissions || [],
        isDeleted: admin.isDeleted || false,
        deletedAt: admin.deletedAt || null,
        createdAt: admin.createdAt,
      },
    });
  }
);

/**
 * @desc    Update admin permissions and level (Super admin only)
 * @route   PUT /api/admin/admins/:id/permissions
 * @access  Private/Super Admin
 */
export const updateAdminPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const currentSuperAdminId = (req as any).user?._id?.toString();
    if (!currentSuperAdminId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const targetAdminId = req.params.id;
    const { adminLevel, permissions } = req.body;

    // Validate adminLevel if provided
    if (adminLevel !== undefined && !Object.values(AdminLevel).includes(adminLevel)) {
      res.status(400);
      throw new Error('Invalid admin level');
    }

    // Validate permissions if provided
    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        res.status(400);
        throw new Error('Permissions must be an array');
      }
      const validPermissions = Object.values(Permission);
      const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p as Permission));
      if (invalidPermissions.length > 0) {
        res.status(400);
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
    }

    try {
      const updatedAdmin = await adminPermissionService.updateAdminPermissions(
        targetAdminId,
        currentSuperAdminId,
        {
          adminLevel,
          permissions,
        }
      );

      res.json({
        success: true,
        message: 'Admin permissions updated successfully',
        admin: {
          _id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          phone: updatedAdmin.phone,
          role: updatedAdmin.role,
          adminLevel: updatedAdmin.adminLevel,
          permissions: updatedAdmin.permissions || [],
        },
      });
    } catch (error: any) {
      if (error.message === 'Admin not found') {
        res.status(404);
        throw new Error('Admin not found');
      }
      if (error.message === 'Cannot modify your own permissions') {
        res.status(403);
        throw new Error('Cannot modify your own permissions');
      }
      if (error.message === 'Cannot demote the last super admin in the system') {
        res.status(400);
        throw new Error('Cannot demote the last super admin in the system');
      }
      if (error.message === 'Cannot restrict permissions for super admin') {
        res.status(400);
        throw new Error('Cannot restrict permissions for super admin');
      }
      throw error;
    }
  }
);

/**
 * @desc    Grant permission to admin (Super admin only)
 * @route   POST /api/admin/admins/:id/permissions/grant
 * @access  Private/Super Admin
 */
export const grantPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const currentSuperAdminId = (req as any).user?._id?.toString();
    if (!currentSuperAdminId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const targetAdminId = req.params.id;
    const { permission } = req.body;

    if (!permission || !Object.values(Permission).includes(permission)) {
      res.status(400);
      throw new Error('Invalid permission');
    }

    try {
      const updatedAdmin = await adminPermissionService.grantPermission(
        targetAdminId,
        currentSuperAdminId,
        permission as Permission
      );

      res.json({
        success: true,
        message: `Permission ${permission} granted successfully`,
        admin: {
          _id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          adminLevel: updatedAdmin.adminLevel,
          permissions: updatedAdmin.permissions || [],
        },
      });
    } catch (error: any) {
      if (error.message === 'Admin not found') {
        res.status(404);
        throw new Error('Admin not found');
      }
      if (error.message === 'Cannot modify your own permissions') {
        res.status(403);
        throw new Error('Cannot modify your own permissions');
      }
      if (error.message === 'Super admin already has all permissions') {
        res.status(400);
        throw new Error('Super admin already has all permissions');
      }
      throw error;
    }
  }
);

/**
 * @desc    Revoke permission from admin (Super admin only)
 * @route   POST /api/admin/admins/:id/permissions/revoke
 * @access  Private/Super Admin
 */
export const revokePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const currentSuperAdminId = (req as any).user?._id?.toString();
    if (!currentSuperAdminId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const targetAdminId = req.params.id;
    const { permission } = req.body;

    if (!permission || !Object.values(Permission).includes(permission)) {
      res.status(400);
      throw new Error('Invalid permission');
    }

    try {
      const updatedAdmin = await adminPermissionService.revokePermission(
        targetAdminId,
        currentSuperAdminId,
        permission as Permission
      );

      res.json({
        success: true,
        message: `Permission ${permission} revoked successfully`,
        admin: {
          _id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          adminLevel: updatedAdmin.adminLevel,
          permissions: updatedAdmin.permissions || [],
        },
      });
    } catch (error: any) {
      if (error.message === 'Admin not found') {
        res.status(404);
        throw new Error('Admin not found');
      }
      if (error.message === 'Cannot modify your own permissions') {
        res.status(403);
        throw new Error('Cannot modify your own permissions');
      }
      if (error.message === 'Cannot revoke permissions from super admin') {
        res.status(400);
        throw new Error('Cannot revoke permissions from super admin');
      }
      throw error;
    }
  }
);

