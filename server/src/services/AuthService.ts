// src/services/AuthService.ts
import { UserService } from "./UserService";
import { redisClient } from "../redis";
import { sendEmail } from "../utils/sendEmail";
import admin from "../firebase-admin";
import User, { IUser } from "../models/UserModel";
import { issueTokens, hashToken } from "../utils/generateToken"; // ✅ NEW
import { RefreshToken } from "../models/RefreshToken";

export interface AuthResponse {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "user" | "admin";
  token: string; // ← only access token
  // ❌ NO refreshToken in response
}

export class AuthService {
  constructor(private userService: UserService) {}

  // 🔐 Email/Password Register
  async registerWithEmail({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userService.findByEmail(normalizedEmail);
    if (existing) throw new Error("User with this email already exists");

    const user = await this.userService.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    });

    return this.toAuthResponse(user);
  }

  // 🔐 Email/Password Login
  async loginWithEmail(
    email: string,
    password: string
  ): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userService.findByEmail(normalizedEmail);
    if (!user) throw new Error("Invalid email or password");
    if (!user.password) {
      throw new Error(
        "This account uses passwordless login. Please use OTP or Google."
      );
    }

    const isMatch = await user.matchPassword(password.trim());
    if (!isMatch) throw new Error("Invalid email or password");

    return this.toAuthResponse(user);
  }

  // 🔐 Google OAuth
  async loginWithGoogle(
    idToken: string
  ): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.email) throw new Error("No email in Google token");

    let user = await this.userService.findByEmail(decoded.email);
    if (!user) {
      user = await this.userService.create({
        name: decoded.name || decoded.email.split("@")[0],
        email: decoded.email,
        avatar: decoded.picture || "",
        role: "user",
      });
    }

    return this.toAuthResponse(user);
  }

  // 🔐 Send OTP
  async sendOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`otp:${email}`, otp, { EX: 600 });
    await sendEmail({
      to: email,
      subject: "Your Login Code",
      html: `<h2>Your OTP: <strong>${otp}</strong></h2><p>Expires in 10 minutes.</p>`,
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });
  }

  // 🔐 OTP Login
  async loginWithOtp(
    email: string,
    otp: string,
    password?: string
  ): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp)
      throw new Error("Invalid or expired OTP");
    await redisClient.del(`otp:${email}`);

    let user = await this.userService.findByEmail(email);
    if (!user) {
      if (password === undefined)
        throw new Error("Password is required for new users");
      user = await this.userService.create({
        name: email.split("@")[0],
        email: email.toLowerCase().trim(),
        password,
        role: "user",
      });
    }

    return this.toAuthResponse(user);
  }

  // 🔐 Firebase Phone Login
  async loginWithPhone(
    idToken: string,
    phone: string
  ): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.phone_number !== phone)
      throw new Error("Phone number mismatch");

    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.create({
        name: `User ${phone.slice(-4)}`,
        phone,
        role: "user",
      });
    }

    return this.toAuthResponse(user);
  }

  // 🔐 Reset Password
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp)
      throw new Error("Invalid or expired OTP");
    await redisClient.del(`otp:${email}`);

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userService.findByEmail(normalizedEmail);
    if (!user) throw new Error("User not found");

    await this.userService.updatePassword(user._id.toString(), newPassword);
    return this.toAuthResponse(user);
  }

  // 🔁 Refresh Access Token (using DB lookup)
  async refreshTokens(rawRefreshToken: string) {
  if (!rawRefreshToken) {
    throw new Error("Refresh token is required");
  }

  const tokenHash = hashToken(rawRefreshToken);
  const dbToken = await RefreshToken.findOne({ tokenHash }).lean(); // lean() for perf

  // 🔍 Debug log
  console.log("🔍 Refresh token lookup:", {
    found: !!dbToken,
    revoked: dbToken?.revoked,
    expired: dbToken?.expiresAt ? dbToken.expiresAt < new Date() : null,
    userId: dbToken?.userId,
  });

  if (!dbToken) {
    throw new Error("Refresh token not found");
  }

  if (dbToken.revoked) {
    throw new Error("Refresh token already used");
  }

  if (dbToken.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  // Revoke immediately to prevent reuse
  await RefreshToken.findByIdAndUpdate(dbToken._id, { revoked: true });

  if (!dbToken.userId) {
    throw new Error("Refresh token has no associated user");
  }

  try {
    const tokens = await issueTokens(dbToken.userId.toString());
    console.log("✅ Tokens refreshed for user:", dbToken.userId);
    return tokens;
  } catch (err) {
    console.error("❌ Failed to issue new tokens:", err);
    throw new Error("Unable to generate new tokens");
  }
}

  // 📬 Check email
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    return !!user;
  }

  // 🎫 Internal: Convert to response + tokens
  private async toAuthResponse(
    user: IUser
  ): Promise<{ user: AuthResponse; rawRefreshToken: string }> {
    const { accessToken, rawRefreshToken } = await issueTokens(
      user._id.toString()
    );
    return {
      user: {
        _id: user._id.toString(),
        name: user.name || "User",
        email: user.email,
        phone: user.phone,
        role: user.role || "user",
        token: accessToken,
      },
      rawRefreshToken,
    };
  }
}