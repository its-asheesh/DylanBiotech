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
import { validate } from "../middleware/validationMiddleware";
import {
  loginSchema,
  googleAuthSchema,
  sendOtpSchema,
  verifyOtpSchema,
  checkEmailSchema,
  resetPasswordSchema,
  firebasePhoneLoginSchema,
} from "../validations/authValidations";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/google", validate(googleAuthSchema), googleAuth);
router.post("/send-otp", validate(sendOtpSchema), sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.get("/check-email", validate(checkEmailSchema), checkEmail);
router.post("/refresh-token", refreshAccessToken); // No validation needed (uses cookie)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post("/firebase-phone-login", validate(firebasePhoneLoginSchema), firebasePhoneLogin);

export default router;
