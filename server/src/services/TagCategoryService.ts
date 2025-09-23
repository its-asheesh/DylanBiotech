import TagCategory, { ITagCategory } from '../models/TagCategory';
import Product from '../models/ProductModel';

export interface CreateTagCategoryInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateTagCategoryInput {
  slug?: string | undefined;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export class TagCategoryService {
  // Get all active tag categories
  async getAllTags(includeInactive = false): Promise<ITagCategory[]> {
    const query = includeInactive ? {} : { isActive: true };
    return await TagCategory.find(query).sort({ name: 1 });
  }

  // Get tag by ID
  async getTagById(id: string): Promise<ITagCategory | null> {
    return await TagCategory.findById(id);
  }

  // Get tag by slug
  async getTagBySlug(slug: string): Promise<ITagCategory | null> {
    return await TagCategory.findOne({ slug, isActive: true });
  }

  // Create new tag category
  async createTag(input: CreateTagCategoryInput): Promise<ITagCategory> {
    const { name, description, color, icon } = input;

    // Check duplicate name
    const existingTag = await TagCategory.findOne({ name });
    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const tag = await TagCategory.create({
      name,
      description,
      color,
      icon,
      slug
    });

    return tag;
  }

  // Update tag category
  async updateTag(id: string, input: UpdateTagCategoryInput): Promise<ITagCategory | null> {
    const tag = await TagCategory.findById(id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    // Check duplicate name
    if (input.name && input.name !== tag.name) {
      const existingTag = await TagCategory.findOne({ name: input.name });
      if (existingTag && existingTag._id.toString() !== id) {
        throw new Error('Tag with this name already exists');
      }
    }

    const updatedTag = await TagCategory.findByIdAndUpdate(
      id,
      input,
      { new: true, runValidators: true }
    );

    if (updatedTag && (input.name || input.slug)) {
      await this.updateProductTagAssociations(tag._id.toString(), updatedTag.slug);
    }

    return updatedTag;
  }

  // Delete tag category
  async deleteTag(id: string): Promise<boolean> {
    const tag = await TagCategory.findById(id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    // Optional: Prevent deletion if used by products
    const productCount = await Product.countDocuments({
      tagCategories: id
    });

    if (productCount > 0) {
      throw new Error(`Cannot delete tag with ${productCount} associated products`);
    }

    const result = await TagCategory.findByIdAndDelete(id);
    return !!result;
  }

  // Update product count for tag (how many products use this tag)
  async updateProductCount(tagId: string): Promise<void> {
    const productCount = await Product.countDocuments({
      tagCategories: tagId,
      isActive: true
    });

    await TagCategory.findByIdAndUpdate(tagId, { productCount });
  }

  // Get tags with product count
  async getTagsWithProductCount(): Promise<ITagCategory[]> {
    return await TagCategory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'tagCategories',
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
        $sort: { name: 1 }
      }
    ]);
  }

  // Search tags
  async searchTags(query: string): Promise<ITagCategory[]> {
    return await TagCategory.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ name: 1 });
  }

  // PRIVATE: Update tag slug in products if tag slug changes (rare)
  private async updateProductTagAssociations(oldTagId: string, newSlug: string): Promise<void> {
    // Note: We don't store slug in Product.tagCategories — only ObjectId
    // So this is optional — only if you denormalize slug for frontend
    // Otherwise, you can remove this method.
    console.log(`Tag slug updated. Consider reindexing if you cache slugs in products.`);
  }
}