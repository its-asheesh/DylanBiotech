import { Router } from 'express';
import * as ctrl from '../controllers/categoryController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { validate } from '../middleware/validationMiddleware';
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

// Admin
router.post('/', protect, isAdmin, upload.single('image'), validate(createCategorySchema), ctrl.createCategory);
router.put('/:id', protect, isAdmin, upload.single('image'), validate(updateCategorySchema), ctrl.updateCategory);
router.delete('/:id', protect, isAdmin, validate(deleteCategorySchema), ctrl.deleteCategory);

export default router;