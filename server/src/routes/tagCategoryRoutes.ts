import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagsWithProductCount,
  searchTags
} from '../controllers/tagCategoryController';

const router = express.Router();

// Admin-only protection
router.use(protect, isAdmin);

router.get('/', getTags);
router.get('/with-count', getTagsWithProductCount);
router.get('/search', searchTags);
router.post('/', createTag);
router.get('/:id', getTagById);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;