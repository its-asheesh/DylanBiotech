// src/routes/productRoutes.ts
import { Router } from 'express';
import * as productCtrl from '../controllers/productController';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  listProductsSchema,
  getProductSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  createVariantSchema,
  getVariantsSchema,
} from '../validations/productValidations';

const router = Router();

// Public routes
router.get('/', validate(listProductsSchema), productCtrl.listProducts);
router.get('/:id', validate(getProductSchema), productCtrl.getProduct);
router.get('/:productId/variants', validate(getVariantsSchema), productCtrl.getVariants);

// Admin-only routes
router.post('/', protect, isAdmin, validate(createProductSchema), productCtrl.createProduct);
router.put('/:id', protect, isAdmin, validate(updateProductSchema), productCtrl.updateProduct);
router.delete('/:id', protect, isAdmin, validate(deleteProductSchema), productCtrl.deleteProduct);

// Variant routes (admin-only creation)
router.post('/variants', protect, isAdmin, validate(createVariantSchema), productCtrl.createVariant);

export default router;