// src/models/UserModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
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

export default mongoose.model<IUser>('User', userSchema);
