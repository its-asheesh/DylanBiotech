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