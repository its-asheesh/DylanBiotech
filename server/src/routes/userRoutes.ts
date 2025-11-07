// src/routes/userRoutes.ts
import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile ,
  changePassword,
  deleteUserAccount,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  restoreUser
} from '../controllers/userController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  listUsersSchema,
  getUserByIdSchema,
  updateUserRoleSchema,
  deleteUserSchema,
  restoreUserSchema,
} from '../validations/userValidations';

const router = Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateUserProfile);
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);
router.route("/delete-account")
  .delete(protect, validate(deleteAccountSchema), deleteUserAccount);

// Admin-only routes (must be before /:id routes to avoid conflicts)
router.get('/', protect, isAdmin, validate(listUsersSchema), listUsers);
router.get('/:id', protect, isAdmin, validate(getUserByIdSchema), getUserById);
router.put('/:id/role', protect, isAdmin, validate(updateUserRoleSchema), updateUserRole);
router.delete('/:id', protect, isAdmin, validate(deleteUserSchema), deleteUser);
router.post('/:id/restore', protect, isAdmin, validate(restoreUserSchema), restoreUser);

export default router;