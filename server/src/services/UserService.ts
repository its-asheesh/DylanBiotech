// src/services/UserService.ts
import User, { IUser } from "../models/UserModel";

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role?: "user" | "admin";
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  avatar?: string;
}

export class UserService {
  async create(input: CreateUserInput): Promise<IUser> {
    const user = new User(input);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return await User.findOne({ phone });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");
    user.password = newPassword; // UserModel should hash on save
    await user.save();
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<IUser> {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");
    Object.assign(user, data);
    return await user.save();
  }

  async deleteUser(userId: string): Promise<void> {
  const result = await User.findByIdAndDelete(userId);
  if (!result) {
    throw new Error("User not found");
  }
  // Optionally: delete related data (orders, favorites, etc.)
}

async verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const user = await this.findById(userId);
  if (!user || !user.password) return false;
  return await user.matchPassword(password);
}
}


