import { Router } from 'express';
import * as ctrl from '../controllers/tagCategoryController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public
router.get('/', ctrl.listTags);
router.get('/:slug', ctrl.getTag);

// Admin
router.post('/', protect, isAdmin, upload.single('icon'), ctrl.createTag);
router.put('/:id', protect, isAdmin, upload.single('icon'), ctrl.updateTag);
router.delete('/:id', protect, isAdmin, ctrl.deleteTag);

export default router;