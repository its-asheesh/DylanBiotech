// src/controllers/authController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import admin from "../firebase-admin";
import { redisClient } from "../redis";
import { sendEmail } from "../utils/sendEmail";
import User from "../models/UserModel";
import { generateAccessToken } from "../utils/generateToken";
import jwt from "jsonwebtoken";

// ✅ Google OAuth — VERIFY token, don't sign in
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  console.log("🔵 Received ID Token:", idToken?.substring(0, 30) + "...");

  if (!idToken || typeof idToken !== "string") {
    res.status(400).json({ message: "ID token is required" });
    return; // ✅ Just return, don't return the response
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("🟢 Decoded Firebase Token:", {
      email: decodedToken.email,
      name: decodedToken.name,
      iss: decodedToken.iss,
    });

    const { email, name, picture } = decodedToken;

    if (!email) {
      res.status(400).json({ message: "No email found in Google account" });
      return; // ✅ Just return
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || email.split("@")[0],
        email,
        avatar: picture || "",
        role: "user",
      });
      await user.save();
      console.log("✅ New user created:", user._id);
    } else {
      console.log("✅ Existing user found:", user._id);
    }

    const token = generateAccessToken(user._id.toString());

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error: any) {
    console.error("🔴 Google Auth Error:", error.message || error);
    res.status(401).json({ message: "Invalid or expired Google token" });
  }
});

// ✅ Send OTP
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ message: "Valid email is required" });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await redisClient.set(`otp:${email}`, otp, { EX: 600 });
  } catch (redisError) {
    console.error("🔴 Redis Error:", redisError);
    res
      .status(500)
      .json({ message: "OTP generation failed. Please try again." });
    return;
  }

  // 🚨 TEMPORARY: Remove try-catch to see REAL email error
  await sendEmail({
    to: email,
    subject: "Your DylanBiotech Login Code",
    html: `<h2>Your OTP: <strong>${otp}</strong></h2><p>This code expires in 10 minutes.</p>`,
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
  });

  console.log(`✅ OTP ${otp} sent to ${email} (logged for dev)`);

  res.status(200).json({ success: true, message: "OTP sent to your email" });
});

// ✅ Verify OTP
// ✅ Verify OTP — NOW ACCEPTS PASSWORD FOR REGISTRATION
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body; // ← ADD password

  if (!email || !otp || typeof email !== "string" || typeof otp !== "string") {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    res.status(400).json({ message: "Invalid or expired OTP" });
    return;
  }

  await redisClient.del(`otp:${email}`);

  let user = await User.findOne({ email });

  if (!user) {
    // ✅ CREATE USER WITH PASSWORD if provided
    user = new User({
      name: email.split("@")[0],
      email,
      password: password || undefined, // ← ✅ Critical fix
      role: "user",
    });
    await user.save();
    console.log("✅ New user created with OTP + password:", user._id);
  } else {
    console.log("✅ Existing user found with OTP:", user._id);
  }

  const token = generateAccessToken(user._id.toString());

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// ✅ Check Email
export const checkEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Valid email is required" });
    return; // ✅ Just return
  }

  // ✅ Normalize email: lowercase + trim
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  res.json({ exists: !!user });
});

//token refresh
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    try {
      // Verify refresh token
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      );
      const user = await User.findById(decoded.id);

      if (!user) {
        res.status(401).json({ message: "Invalid refresh token" });
        return;
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user._id.toString());

      res.status(200).json({
        token: newAccessToken,
        // Don't return new refresh token — reuse existing one
      });
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  }
);

// ✅ Reset Password
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
      return;
    }

    // ✅ Verify OTP
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // ✅ Find user
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Update password
    user.password = newPassword;
    await user.save();

    // ✅ Delete OTP
    await redisClient.del(`otp:${email}`);

    // ✅ Generate token
    const token = generateAccessToken(user._id.toString());

    res.status(200).json({
      message: "Password reset successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
);
