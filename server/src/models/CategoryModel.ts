import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  image?: string;
  slug: string;
  isActive: boolean;
  isMain: boolean; // true = main category (Male/Female/Unisex), false = subcategory
  parent?: Types.ObjectId; // if subcategory, points to main category
  level: number; // 0 = main, 1 = sub, 2 = sub-sub (if needed later)
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  image: { 
    type: String,
    default: null
  },
  slug: { 
    type: String, 
    required: [true, 'Slug is required'], // Will be auto-generated in pre-validate hook
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string): boolean {
        return Boolean(v && v.length > 0);
      },
      message: 'Slug cannot be empty'
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isMain: {
    type: Boolean,
    required: true,
    default: false
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    required: true,
    default: 0 // 0 = main, 1 = sub, 2 = sub-sub (future-proof)
  },
  productCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Auto-generate slug from name
categorySchema.pre('validate', function(next) {
  const doc = this as ICategory & { isModified: (path: string) => boolean };
  // Generate slug before validation if it's missing or if name has changed
  if (!doc.slug || doc.isModified('name')) {
    if (doc.name && doc.name.trim()) {
      doc.slug = doc.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Ensure slug is not empty after generation
      if (!doc.slug) {
        // Fallback: use a default slug if name doesn't generate a valid slug
        doc.slug = `category-${Date.now()}`;
      }
    }
  }
  next();
});

// Virtual for URL
categorySchema.virtual('url').get(function() {
  const doc = this as ICategory;
  return `/categories/${doc.slug}`;
});

// Index for performance
categorySchema.index({ isMain: 1, isActive: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
// categorySchema.index({ slug: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);