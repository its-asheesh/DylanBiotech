import { Router } from 'express';
import * as ctrl from '../controllers/tagCategoryController';
import { protect } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { Permission } from '../types/permissions';
import {
  createTagSchema,
  updateTagSchema,
  getTagSchema,
  deleteTagSchema,
} from '../validations/tagCategoryValidations';

const router = Router();

// Public
router.get('/', ctrl.listTags);
router.get('/:slug', validate(getTagSchema), ctrl.getTag);

// Admin routes with permission checks
router.post(
  '/',
  protect,
  requirePermission(Permission.MANAGE_TAG_CATEGORIES),
  upload.single('icon'),
  validate(createTagSchema),
  ctrl.createTag
);
router.put(
  '/:id',
  protect,
  requirePermission(Permission.MANAGE_TAG_CATEGORIES),
  upload.single('icon'),
  validate(updateTagSchema),
  ctrl.updateTag
);
router.delete(
  '/:id',
  protect,
  requirePermission(Permission.MANAGE_TAG_CATEGORIES),
  validate(deleteTagSchema),
  ctrl.deleteTag
);

export default router;