import { Router } from 'express';
import * as ctrl from '../controllers/categoryController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public
router.get('/', ctrl.listCategories);
router.get('/:slug', ctrl.getCategory);

// Admin
router.post('/', protect, isAdmin, upload.single('image'), ctrl.createCategory);
router.put('/:id', protect, isAdmin, upload.single('image'), ctrl.updateCategory);
router.delete('/:id', protect, isAdmin, ctrl.deleteCategory);

export default router;