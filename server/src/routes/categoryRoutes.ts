import { Router } from 'express';
import * as ctrl from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { Permission } from '../types/permissions';
import {
  listCategoriesSchema,
  getCategorySchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from '../validations/categoryValidations';

const router = Router();

// Public
router.get('/', validate(listCategoriesSchema), ctrl.listCategories);
router.get('/:slug', validate(getCategorySchema), ctrl.getCategory);

// Admin routes with permission checks
router.post(
  '/',
  protect,
  requirePermission(Permission.MANAGE_CATEGORIES),
  upload.single('image'),
  validate(createCategorySchema),
  ctrl.createCategory
);
router.put(
  '/:id',
  protect,
  requirePermission(Permission.MANAGE_CATEGORIES),
  upload.single('image'),
  validate(updateCategorySchema),
  ctrl.updateCategory
);
router.delete(
  '/:id',
  protect,
  requirePermission(Permission.MANAGE_CATEGORIES),
  validate(deleteCategorySchema),
  ctrl.deleteCategory
);

export default router;