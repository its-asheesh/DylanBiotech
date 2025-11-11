// src/models/UserModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminLevel, Permission } from '../types/permissions';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'user' | 'admin';
  adminLevel?: AdminLevel; // Admin hierarchy level (only for admins)
  permissions?: Permission[]; // Custom permissions (only for admins)
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  hasPermission(permission: Permission): boolean;
  isSuperAdmin(): boolean;
  isAdmin(): boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  adminLevel: { 
    type: Number, 
    enum: [AdminLevel.MODERATOR, AdminLevel.ADMIN, AdminLevel.SUPER_ADMIN],
    default: null,
    required: function(this: IUser) {
      return this.role === 'admin';
    }
  },
  permissions: { 
    type: [String], 
    enum: Object.values(Permission),
    default: []
  },
  phone: { type: String, unique: true, sparse: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  console.log('🔑 matchPassword called');
  console.log('🔑 Entered password:', enteredPassword);
  console.log('🔑 Stored hash:', this.password);

  if (!this.password) {
    console.log('🔑 No password set on user');
    return false;
  }

  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log('🔑 bcrypt.compare result:', isMatch);

  return isMatch;
};

// Check if user has a specific permission
userSchema.methods.hasPermission = function (permission: Permission): boolean {
  if (this.role !== 'admin') return false;
  
  // Super admin has all permissions
  if (this.adminLevel === AdminLevel.SUPER_ADMIN) return true;
  
  // Check custom permissions
  return this.permissions && this.permissions.includes(permission);
};

// Check if user is super admin
userSchema.methods.isSuperAdmin = function (): boolean {
  return this.role === 'admin' && this.adminLevel === AdminLevel.SUPER_ADMIN;
};

// Check if user is any type of admin
userSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin';
};

export default mongoose.model<IUser>('User', userSchema);
