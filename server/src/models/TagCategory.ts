import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITagCategory extends Document {
  _id: Types.ObjectId;
  name: string; // "Best Seller", "New Arrival", "Sale"
  slug: string;
  description?: string;
  color?: string; // optional UI color (e.g., "red", "green")
  icon?: string; // optional icon class or name
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const tagCategorySchema = new Schema<ITagCategory>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { 
    type: String, 
    maxlength: 200
  },
  color: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  productCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Auto-generate slug
tagCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for URL
tagCategorySchema.virtual('url').get(function() {
  return `/tags/${this.slug}`;
});

// Index
tagCategorySchema.index({ slug: 1, isActive: 1 });

export default mongoose.model<ITagCategory>('TagCategory', tagCategorySchema);