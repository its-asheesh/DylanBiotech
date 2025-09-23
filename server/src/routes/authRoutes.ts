// src/routes/authRoutes.ts
import { Router } from "express";
import {
  googleAuth,
  sendOtp,
  verifyOtp,
  checkEmail,
  refreshAccessToken,
  resetPassword
} from "../controllers/authController";

const router = Router();

router.post("/google", googleAuth);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/check-email", checkEmail);
router.post("/refresh-token", refreshAccessToken);
router.post('/reset-password', resetPassword);

export default router;
