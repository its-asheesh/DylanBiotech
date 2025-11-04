// src/controllers/authController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { hashToken } from "../utils/generateToken";
import { RefreshToken } from "../models/RefreshToken";

const userService = new UserService();
const authService = new AuthService(userService);

// 🔐 Email/Password Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, rawRefreshToken } = await authService.registerWithEmail({
    name,
    email,
    password,
  });

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", rawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh-token",
  });

  res.status(201).json(user);
});

// 🔐 Email/Password Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, rawRefreshToken } = await authService.loginWithEmail(
    email,
    password
  );

  res.cookie("refreshToken", rawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh-token",
  });

  res.json(user);
});

// 🔐 Google OAuth
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user, rawRefreshToken } = await authService.loginWithGoogle(
      req.body.idToken
    );

    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/auth/refresh-token",
    });

    res.json(user);
  } catch (error: any) {
    console.error("🔴 Google Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired Google token" });
  }
});

// 🔐 Send OTP
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    await authService.sendOtp(req.body.email);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error: any) {
    console.error("OTP send error:", error);
    res
      .status(500)
      .json({ message: "OTP generation failed. Please try again." });
  }
});

// 🔐 Verify OTP
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user, rawRefreshToken } = await authService.loginWithOtp(
      req.body.email,
      req.body.otp,
      req.body.password
    );

    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/api/auth/refresh-token",
    });

    res.json(user);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "OTP verification failed" });
  }
});

// 🔍 Check Email
export const checkEmail = asyncHandler(async (req: Request, res: Response) => {
  const exists = await authService.checkEmailExists(req.query.email as string);
  res.json({ exists });
});

// 🔁 Refresh Access Token (reads cookie automatically)
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    // ✅ Get refresh token from HTTP-only cookie
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken) {
      void res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    try {
      // ✅ Use the NEW secure refresh method (DB lookup + rotation)
      const { accessToken, rawRefreshToken: newRawRefreshToken } =
        await authService.refreshTokens(rawRefreshToken); // ← note: refreshTokens, not refreshAccessToken

      // ✅ Set NEW refresh token cookie (rotation)
      res.cookie("refreshToken", newRawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/api/auth/refresh-token",
      });

      void res.json({ token: accessToken });
    } catch (error: any) {
      console.error("Refresh token error:", error.message);
      void res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }
  }
);

// 🔐 Reset Password
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { user, rawRefreshToken } = await authService.resetPassword(
        req.body.email,
        req.body.otp,
        req.body.newPassword
      );

      res.cookie("refreshToken", rawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/auth/refresh-token",
      });

      res.json({
        message: "Password reset successfully",
        ...user,
      });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Password reset failed" });
    }
  }
);

// 📱 Firebase Phone Login
export const firebasePhoneLogin = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { user, rawRefreshToken } = await authService.loginWithPhone(
        req.body.idToken,
        req.body.phone
      );

      res.cookie("refreshToken", rawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/auth/refresh-token",
      });

      res.json(user);
    } catch (error: any) {
      console.error("Firebase Phone Auth Error:", error);
      res.status(401).json({ message: error.message || "Invalid ID token" });
    }
  }
);

// 🚪 Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies.refreshToken;
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.updateOne({ tokenHash }, { revoked: true });
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });
  res.json({ success: true, message: "Logged out successfully" });
});
