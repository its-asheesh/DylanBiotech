import Category, { ICategory } from '../models/CategoryModel';
import Product from '../models/ProductModel';

export interface CreateCategoryInput {
  name: string;
  description: string;
  image?: string;
  featured?: boolean;
  isMain: boolean;           // ✅ Required now
  parent?: string;           // ✅ For subcategories
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  featured?: boolean;
  isMain?: boolean;          // ✅ Optional update
  parent?: string;           // ✅ Can reparent
  level?: number;
}

export class CategoryService {
  // Get all categories (main + sub)
  async getAllCategories(includeInactive = false): Promise<ICategory[]> {
    const query = includeInactive ? {} : { isActive: true };
    return await Category.find(query)
      .sort({ isMain: -1, name: 1 }) // Main first, then alphabetical
      .populate('parent', 'name');   // Optional: show parent name
  }

  // Get only main categories
  async getMainCategories(): Promise<ICategory[]> {
    return await Category.find({ isMain: true, isActive: true })
      .sort({ name: 1 });
  }

  // Get subcategories by parent ID
  async getSubCategoriesByParent(parentId: string): Promise<ICategory[]> {
    return await Category.find({ 
      parent: parentId, 
      isActive: true 
    }).sort({ name: 1 });
  }

  // Get featured categories
  async getFeaturedCategories(): Promise<ICategory[]> {
    return await Category.find({ 
      isActive: true, 
      featured: true 
    }).sort({ name: 1 });
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<ICategory | null> {
    return await Category.findById(id).populate('parent', 'name');
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug, isActive: true }).populate('parent', 'name');
  }

  // Create new category (main or sub)
  async createCategory(input: CreateCategoryInput): Promise<ICategory> {
    const { name, description, image, featured = false, isMain, parent } = input;

    // Check duplicate name
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    // Validate parent if not main
    if (!isMain && parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      if (!parentCategory.isMain) {
        throw new Error('Parent must be a main category');
      }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      description,
      image,
      featured,
      slug,
      isMain,
      parent: isMain ? null : parent,
      level: isMain ? 0 : parent ? 1 : 0
    });

    return category;
  }

  // Update category
  async updateCategory(id: string, input: UpdateCategoryInput): Promise<ICategory | null> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check duplicate name
    if (input.name && input.name !== category.name) {
      const existingCategory = await Category.findOne({ name: input.name });
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new Error('Category with this name already exists');
      }
    }

    // Validate parent if changing
    if (input.parent && !input.isMain) {
      const parentCategory = await Category.findById(input.parent);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      if (!parentCategory.isMain) {
        throw new Error('Parent must be a main category');
      }
    }

    // Auto-set level and parent based on isMain
    if (input.isMain !== undefined) {
      input.level = input.isMain ? 0 : category.parent ? 1 : 0;
      if (input.isMain) {
        delete input.parent;
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      input,
      { new: true, runValidators: true }
    ).populate('parent', 'name');

    if (updatedCategory) {
      // Update product counts if name/slug changed
      await this.updateProductCount(updatedCategory._id.toString());
    }

    return updatedCategory;
  }

  // Delete category
  async deleteCategory(id: string): Promise<boolean> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if used in any products — as main OR sub category
    const productCount = await Product.countDocuments({
      $or: [
        { mainCategory: id },
        { subCategory: id }
      ]
    });

    if (productCount > 0) {
      throw new Error(`Cannot delete category with ${productCount} associated products`);
    }

    const result = await Category.findByIdAndDelete(id);
    return !!result;
  }

  // Update product count for a category (used as main or sub)
  async updateProductCount(categoryId: string): Promise<void> {
    const productCount = await Product.countDocuments({
      $or: [
        { mainCategory: categoryId },
        { subCategory: categoryId }
      ],
      isActive: true
    });

    await Category.findByIdAndUpdate(categoryId, { productCount });
  }

  // Get categories with product count (main + sub)
  async getCategoriesWithProductCount(): Promise<ICategory[]> {
    return await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$mainCategory', '$$categoryId'] },
                    { $eq: ['$subCategory', '$$categoryId'] }
                  ]
                },
                isActive: true
              }
            }
          ],
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $match: { isActive: true }
      },
      {
        $sort: { isMain: -1, name: 1 }
      }
    ]);
  }

  // Search categories
  async searchCategories(query: string): Promise<ICategory[]> {
    return await Category.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ name: 1 })
    .populate('parent', 'name');
  }
}