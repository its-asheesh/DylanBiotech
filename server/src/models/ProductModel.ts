import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  description: string;
  price: number;
  mainCategory: Types.ObjectId; // Required — e.g., Male, Female
  subCategory?: Types.ObjectId; // Optional — e.g., Perfume, Deodorant
  tagCategories: Types.ObjectId[]; // e.g., [Best Seller, New Arrival]
  stock: number;
  image: string;
  images?: string[]; // optional — for gallery
  isActive: boolean;
  featured: boolean;
  rating?: number; // optional
  reviews?: number; // optional
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  brand: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  mainCategory: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  subCategory: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    default: null
  },
  tagCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'TagCategory',
    default: []
  }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, required: true }, // main image
  images: [{ type: String }], // optional gallery
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for performance
productSchema.index({ mainCategory: 1, isActive: 1 });
productSchema.index({ subCategory: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ tagCategories: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' }); // text search

export default mongoose.model<IProduct>('Product', productSchema);