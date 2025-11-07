import { Router } from 'express';
import * as ctrl from '../controllers/tagCategoryController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validate } from '../middleware/validationMiddleware';
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

// Admin
router.post('/', protect, isAdmin, upload.single('icon'), validate(createTagSchema), ctrl.createTag);
router.put('/:id', protect, isAdmin, upload.single('icon'), validate(updateTagSchema), ctrl.updateTag);
router.delete('/:id', protect, isAdmin, validate(deleteTagSchema), ctrl.deleteTag);

export default router;