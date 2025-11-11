// src/routes/adminRoutes.ts
import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminController';
import {
  listAdmins,
  getAdminById,
  updateAdminPermissions,
  grantPermission,
  revokePermission,
} from '../controllers/adminPermissionController';
import { protect } from '../middleware/authMiddleware';
import { requirePermission, requireSuperAdmin } from '../middleware/permissionMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { Permission } from '../types/permissions';
import {
  listAdminsSchema,
  getAdminByIdSchema,
  updateAdminPermissionsSchema,
  grantPermissionSchema,
  revokePermissionSchema,
} from '../validations/adminPermissionValidations';

const router = Router();

// Dashboard stats - requires view_dashboard permission
router.get(
  '/stats',
  protect,
  requirePermission(Permission.VIEW_DASHBOARD),
  getDashboardStats
);

// Admin management routes - super admin only
router.get(
  '/admins',
  protect,
  requireSuperAdmin,
  validate(listAdminsSchema),
  listAdmins
);
router.get(
  '/admins/:id',
  protect,
  requireSuperAdmin,
  validate(getAdminByIdSchema),
  getAdminById
);
router.put(
  '/admins/:id/permissions',
  protect,
  requireSuperAdmin,
  validate(updateAdminPermissionsSchema),
  updateAdminPermissions
);
router.post(
  '/admins/:id/permissions/grant',
  protect,
  requireSuperAdmin,
  validate(grantPermissionSchema),
  grantPermission
);
router.post(
  '/admins/:id/permissions/revoke',
  protect,
  requireSuperAdmin,
  validate(revokePermissionSchema),
  revokePermission
);

export default router;

