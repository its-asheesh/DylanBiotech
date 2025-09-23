// src/controllers/userController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { UserService } from '../services/UserService';

const userService = new UserService();

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Please provide name, email and password' });
    return;
  }

  try {
    const userData = await userService.register(req.body);
    res.status(201).json(userData);
  } catch (error: any) {
    // Handle specific known errors
    if (error.message === 'User with this email already exists') {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }
    
    // Log unexpected errors
    console.error('User registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }

  try {
    const userData = await userService.login(req.body);
    res.status(200).json(userData);
  } catch (error: any) {
    // Handle specific known errors
    if (error.message === 'Invalid email or password') {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    
    if (error.message === 'This account uses passwordless login. Please use OTP or Google.') {
      res.status(400).json({ message: 'This account uses passwordless login. Please use OTP or Google.' });
      return;
    }
    
    // Log unexpected errors
    console.error('User login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private (requires authentication middleware)
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // This would require authentication middleware to set req.user
  // For now, just return a placeholder
  res.status(200).json({
    message: 'User profile endpoint - implement with auth middleware'
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private (requires authentication middleware)
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  // This would require authentication middleware to set req.user
  // For now, just return a placeholder
  res.status(200).json({
    message: 'User profile update endpoint - implement with auth middleware',
    updatedFields: { name, email }
  });
});