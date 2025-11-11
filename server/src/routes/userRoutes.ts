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
import { protect } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { Permission } from '../types/permissions';
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

// Admin-only routes with permission checks (must be before /:id routes to avoid conflicts)
router.get(
  '/',
  protect,
  requirePermission(Permission.VIEW_USERS),
  validate(listUsersSchema),
  listUsers
);
router.get(
  '/:id',
  protect,
  requirePermission(Permission.VIEW_USERS),
  validate(getUserByIdSchema),
  getUserById
);
router.put(
  '/:id/role',
  protect,
  requirePermission(Permission.MANAGE_USER_ROLES),
  validate(updateUserRoleSchema),
  updateUserRole
);
router.delete(
  '/:id',
  protect,
  requirePermission(Permission.DELETE_USERS),
  validate(deleteUserSchema),
  deleteUser
);
router.post(
  '/:id/restore',
  protect,
  requirePermission(Permission.MANAGE_USERS),
  validate(restoreUserSchema),
  restoreUser
);

export default router;