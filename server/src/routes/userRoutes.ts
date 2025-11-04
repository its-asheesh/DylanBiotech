// src/routes/userRoutes.ts
import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile ,
  changePassword,
  deleteUserAccount
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/change-password', protect, changePassword);
router.route("/delete-account")
  .delete(protect, deleteUserAccount);

export default router;