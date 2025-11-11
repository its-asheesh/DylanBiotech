// src/routes/productRoutes.ts
import { Router } from 'express';
import * as productCtrl from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { Permission } from '../types/permissions';
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

// Admin-only routes with permission checks
// Note: Using upload.fields for multiple images - main image and additional images
router.post(
  '/',
  protect,
  requirePermission(Permission.CREATE_PRODUCTS),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validate(createProductSchema),
  productCtrl.createProduct
);
router.put(
  '/:id',
  protect,
  requirePermission(Permission.UPDATE_PRODUCTS),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validate(updateProductSchema),
  productCtrl.updateProduct
);
router.delete(
  '/:id',
  protect,
  requirePermission(Permission.DELETE_PRODUCTS),
  validate(deleteProductSchema),
  productCtrl.deleteProduct
);

// Variant routes (admin-only creation)
router.post(
  '/variants',
  protect,
  requirePermission(Permission.CREATE_PRODUCTS),
  upload.single('image'),
  validate(createVariantSchema),
  productCtrl.createVariant
);

export default router;