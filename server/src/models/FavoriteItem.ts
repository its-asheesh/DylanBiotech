//src/models/FavoriteItem

import { Types, Schema } from "mongoose";

// Links product (or variant) to a collection
export interface IFavoriteItem extends Document {
  user: Types.ObjectId;
  collection: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId; // optional
  addedAt: Date;
}

const favoriteItemSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collection: { type: Schema.Types.ObjectId, ref: 'FavoriteCollection', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' }
}, { timestamps: { createdAt: 'addedAt' } });

favoriteItemSchema.index({ user: 1, collection: 1 });
favoriteItemSchema.index({ product: 1 });