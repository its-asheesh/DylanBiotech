// src/services/UserService.ts
import User, { IUser } from "../models/UserModel";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

export interface RegisterInput {
  name: string;
  email: string;
  password?: string; // Optional for passwordless
  role?: "user" | "admin";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  token: string;
  refreshToken: string;
}

export class UserService {
  /**
   * Registers a new user
   * @throws Error if user already exists
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, role = "user" } = input;

    // ✅ Validate required fields
    if (!name?.trim()) throw new Error("Name is required");
    if (!email?.trim()) throw new Error("Email is required");

    // ✅ Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      throw new Error("User with this email already exists");
    }

    // ✅ Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password, // If undefined, UserModel should handle it (e.g., for passwordless)
      role,
    });

    return this.toAuthResponse(user);
  }

  /**
   * Logs in user with email + password
   * @throws Error if invalid credentials
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    if (!email?.trim() || !password) {
      throw new Error("Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error(
        "This account uses passwordless login. Please use OTP or Google."
      );
    }

    console.log("🔐 Login attempt for:", user.email);
    console.log("🔐 Entered password length:", password.length);

    const isMatch = await user.matchPassword(password.trim());
    console.log("🔐 Final match result:", isMatch);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    return this.toAuthResponse(user);
  }
  /**
   * Passwordless login (Google, OTP, Magic Link)
   * Creates user if doesn't exist
   */
  async loginPasswordless(email: string): Promise<AuthResponse> {
    if (!email?.trim()) {
      throw new Error("Email is required for passwordless login");
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    // ✅ Auto-create user if not exists (for Google/OTP)
    if (!user) {
      const defaultName = email.split("@")[0];

      user = await User.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1), // Capitalize
        email: normalizedEmail,
        role: "user",
        // No password — intentionally left undefined
      });
    }

    return this.toAuthResponse(user);
  }

  /**
   * Converts IUser to AuthResponse
   * Ensures _id is string and generates token
   */
  private toAuthResponse(user: IUser): AuthResponse {
    if (!user._id) {
      throw new Error("User ID is missing");
    }

    return {
      _id: user._id.toString(),
      name: user.name || "User",
      email: user.email,
      role: user.role || "user",
      token: generateAccessToken(user._id.toString()),
      refreshToken: generateRefreshToken(user._id.toString()),
    };
  }
}
