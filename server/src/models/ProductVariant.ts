// src/models/ProductVariant.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductVariant extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId; // ref to Product
  name: string; // e.g., "100ml - Ocean Breeze"
  sku: string; // Stock Keeping Unit (unique)
  price: number;
  stock: number;
  attributes: Record<string, string>; // e.g., { size: "100ml", scent: "Ocean" }
  image?: string; // optional variant-specific image
  isActive: boolean;
}

const variantSchema = new Schema<IProductVariant>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  attributes: { type: Schema.Types.Mixed, default: {} },
  image: String,
  isActive: { type: Boolean, default: true }
});

variantSchema.index({ product: 1, isActive: 1 });
// variantSchema.index({ sku: 1 });

export default mongoose.model<IProductVariant>('ProductVariant', variantSchema);