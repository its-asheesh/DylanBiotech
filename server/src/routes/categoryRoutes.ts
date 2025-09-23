import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} from '../controllers/categoryController';

const router = express.Router();

// Admin-only routes
router.use(protect, isAdmin);

router.get('/', getCategories);
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;