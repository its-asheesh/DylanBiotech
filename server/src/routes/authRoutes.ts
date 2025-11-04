// src/routes/authRoutes.ts
import { Router } from "express";
import {
  googleAuth,
  sendOtp,
  verifyOtp,
  checkEmail,
  refreshAccessToken,
  resetPassword,
  firebasePhoneLogin,
  login,
  logout
} from "../controllers/authController";

const router = Router();

router.post("/login",login);
router.post("/logout",logout)
router.post("/google", googleAuth);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/check-email", checkEmail);
router.post("/refresh-token", refreshAccessToken);
router.post('/reset-password', resetPassword);
router.post("/firebase-phone-login", firebasePhoneLogin);


export default router;
