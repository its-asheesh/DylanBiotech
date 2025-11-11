// src/controllers/userController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { UserService } from "../services/UserService";
import User from "../models/UserModel";

const userService = new UserService();

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user?._id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      adminLevel: user.role === 'admin' ? user.adminLevel : undefined,
      permissions: user.role === 'admin' ? user.permissions : undefined,
    });
  }
);

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user?._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email ? req.body.email.toLowerCase().trim() : user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current and new password are required");
    }

    const user = await User.findById((req as any).user?._id);
    if (!user || !user.password) {
      res.status(404);
      throw new Error("User not found");
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  }
);

export const deleteUserAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const { password } = req.body;
    if (!password) {
      res.status(400);
      throw new Error("Password is required to delete your account");
    }

    const isPasswordValid = await userService.verifyUserPassword(userId, password);
    if (!isPasswordValid) {
      res.status(400);
      throw new Error("Password is incorrect");
    }

    await userService.deleteUser(userId);
    res.json({ message: "Your account has been permanently deleted." });
  }
);

/**
 * @desc    List all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const listUsers = asyncHandler(
  async (req: Request, res: Response) => {
    // Query parameters are validated and transformed by Zod middleware
    const page = (req.query.page as unknown as number) || 1;
    const limit = (req.query.limit as unknown as number) || 10;
    const role = req.query.role as 'user' | 'admin' | undefined;
    const search = req.query.search as string | undefined;
    const includeDeleted = req.query.includeDeleted as boolean | undefined;
    const onlyDeleted = req.query.onlyDeleted as boolean | undefined;
    const createdFrom = req.query.createdFrom as string | undefined;
    const createdTo = req.query.createdTo as string | undefined;
    const hasPhone = req.query.hasPhone as boolean | undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    // Business logic validation: mutually exclusive filters
    if (includeDeleted && onlyDeleted) {
      res.status(400);
      throw new Error('Cannot use both includeDeleted and onlyDeleted. Use only one.');
    }

    // Business logic validation: date range
    if (createdFrom && createdTo) {
      const fromDate = new Date(createdFrom);
      const toDate = new Date(createdTo);
      if (fromDate > toDate) {
        res.status(400);
        throw new Error('createdFrom date must be before or equal to createdTo date');
      }
    }

    const result = await userService.listUsers(
      {
        role,
        search,
        includeDeleted,
        onlyDeleted,
        createdFrom,
        createdTo,
        hasPhone,
      },
      page,
      limit,
      sortBy,
      sortOrder
    );

    res.json({
      success: true,
      ...result,
    });
  }
);

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    // User ID is validated by Zod middleware
    const userId = req.params.id;

    const user = await userService.getUserByIdForAdmin(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isDeleted: user.isDeleted || false,
        deletedAt: user.deletedAt || null,
        createdAt: user.createdAt,
      },
    });
  }
);

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const currentAdminId = (req as any).user?._id?.toString();
    if (!currentAdminId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // Role and user ID are validated by Zod middleware
    const { role, adminLevel } = req.body;
    const targetUserId = req.params.id;

    try {
      const updatedUser = await userService.updateUserRole(
        targetUserId,
        role,
        currentAdminId,
        adminLevel
      );

      res.json({
        success: true,
        message: "User role updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      });
    } catch (error: any) {
      // Handle specific error messages from service
      if (error.message === 'User not found') {
        res.status(404);
        throw new Error('User not found');
      }
      if (error.message === 'Cannot change your own role') {
        res.status(403);
        throw new Error('Cannot change your own role');
      }
      if (error.message === 'Cannot demote the last admin in the system') {
        res.status(400);
        throw new Error('Cannot demote the last admin in the system');
      }
      // Re-throw other errors
      throw error;
    }
  }
);

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const currentAdminId = (req as any).user?._id?.toString();
    if (!currentAdminId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // User ID and hardDelete are validated by Zod middleware
    const targetUserId = req.params.id;
    const hardDelete = req.query.hardDelete as boolean | undefined;

    try {
      await userService.deleteUserForAdmin(targetUserId, currentAdminId, hardDelete);

      res.json({
        success: true,
        message: hardDelete 
          ? "User permanently deleted" 
          : "User deleted successfully (soft delete)",
      });
    } catch (error: any) {
      // Handle specific error messages from service
      if (error.message === 'User not found') {
        res.status(404);
        throw new Error('User not found');
      }
      if (error.message === 'User is already deleted') {
        res.status(400);
        throw new Error('User is already deleted');
      }
      if (error.message === 'Cannot delete your own account') {
        res.status(403);
        throw new Error('Cannot delete your own account');
      }
      if (error.message === 'Cannot delete the last admin in the system') {
        res.status(400);
        throw new Error('Cannot delete the last admin in the system');
      }
      // Re-throw other errors
      throw error;
    }
  }
);

/**
 * @desc    Restore deleted user (Admin only)
 * @route   POST /api/users/:id/restore
 * @access  Private/Admin
 */
export const restoreUser = asyncHandler(
  async (req: Request, res: Response) => {
    // User ID is validated by Zod middleware
    const targetUserId = req.params.id;

    try {
      const restoredUser = await userService.restoreUser(targetUserId);

      res.json({
        success: true,
        message: "User restored successfully",
        user: {
          _id: restoredUser._id,
          name: restoredUser.name,
          email: restoredUser.email,
          phone: restoredUser.phone,
          role: restoredUser.role,
          isDeleted: restoredUser.isDeleted,
        },
      });
    } catch (error: any) {
      // Handle specific error messages from service
      if (error.message === 'User not found') {
        res.status(404);
        throw new Error('User not found');
      }
      if (error.message === 'User is not deleted') {
        res.status(400);
        throw new Error('User is not deleted');
      }
      // Re-throw other errors
      throw error;
    }
  }
);