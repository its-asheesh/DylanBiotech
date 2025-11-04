// src/routes/productRoutes.ts
import { Router } from 'express';
import * as productCtrl from '../controllers/productController';
import { protect, isAdmin } from '../middleware/authMiddleware'; // your existing middleware

const router = Router();

// Public routes
router.get('/', productCtrl.listProducts);
router.get('/:id', productCtrl.getProduct);
router.get('/:productId/variants', productCtrl.getVariants);

// Admin-only routes
router.post('/', protect, isAdmin, productCtrl.createProduct);
router.put('/:id', protect, isAdmin, productCtrl.updateProduct);
router.delete('/:id', protect, isAdmin, productCtrl.deleteProduct);

// Variant routes (admin-only creation)
router.post('/variants', protect, isAdmin, productCtrl.createVariant);

export default router;