import { Schema, Types } from "mongoose";

// src/models/FavoriteCollection.ts
export interface IFavoriteCollection extends Document {
  name: string;
  user: Types.ObjectId;
  isDefault: boolean; // e.g., "My Wishlist"
  createdAt: Date;
}

const favoriteCollectionSchema = new Schema({
  name: { type: String, required: true, maxlength: 50 },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

favoriteCollectionSchema.index({ user: 1 });