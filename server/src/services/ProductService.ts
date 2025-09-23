import Product, { IProduct } from '../models/ProductModel';
import Category from '../models/CategoryModel';
import TagCategory from '../models/TagCategory';

export interface CreateProductInput {
  name: string;
  brand: string;
  description: string;
  price: number;
  mainCategory: string;           // ✅ Required
  subCategory?: string;           // ✅ Optional
  tagCategories?: string[];       // ✅ Optional array of tag IDs
  stock: number;
  image: string;
  images?: string[];              // ✅ Optional gallery
  featured?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  brand?: string;
  description?: string;
  price?: number;
  mainCategory?: string;          // ✅
  subCategory?: string;           // ✅
  tagCategories?: string[];       // ✅
  stock?: number;
  image?: string;
  images?: string[];              // ✅
  isActive?: boolean;
  featured?: boolean;
}

export interface ProductFilters {
  mainCategory?: string;          // ✅ Filter by main category
  subCategory?: string;           // ✅ Filter by subcategory
  tagCategories?: string[];       // ✅ Filter by one or more tags
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
}

export class ProductService {
  // Get all products with optional filters
  async getProducts(filters: ProductFilters = {}): Promise<IProduct[]> {
    const query: any = { isActive: true };

    // Main category filter
    if (filters.mainCategory) {
      query.mainCategory = filters.mainCategory;
    }

    // Subcategory filter
    if (filters.subCategory) {
      query.subCategory = filters.subCategory;
    }

    // Tag categories filter (match any of the given tags)
    if (filters.tagCategories && filters.tagCategories.length > 0) {
      query.tagCategories = { $in: filters.tagCategories };
    }

    // Featured filter
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    // Search filter (text index on name, description, brand)
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Brand filter
    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: 'i' };
    }

    return await Product.find(query)
      .populate('mainCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('tagCategories', 'name slug color icon')
      .sort({ createdAt: -1 })
      .exec(); // ✅ Fixed
  }

  // Get featured products
  async getFeaturedProducts(): Promise<IProduct[]> {
    return await Product.find({ 
      isActive: true, 
      featured: true 
    })
      .populate('mainCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('tagCategories', 'name slug color icon')
      .sort({ createdAt: -1 })
      .exec(); // ✅ Fixed
  }

  // Get products by main category
  async getProductsByMainCategory(mainCategoryId: string): Promise<IProduct[]> {
    return await Product.find({ 
      mainCategory: mainCategoryId, 
      isActive: true 
    })
      .populate('mainCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('tagCategories', 'name slug color icon')
      .sort({ createdAt: -1 })
      .exec(); // ✅ Fixed
  }

  // Get products by subcategory
  async getProductsBySubCategory(subCategoryId: string): Promise<IProduct[]> {
    return await Product.find({ 
      subCategory: subCategoryId, 
      isActive: true 
    })
      .populate('mainCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('tagCategories', 'name slug color icon')
      .sort({ createdAt: -1 })
      .exec(); // ✅ Fixed
  }

  // Get single product by ID
  async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id)
      .populate('mainCategory', 'name slug description')
      .populate('subCategory', 'name slug description')
      .populate('tagCategories', 'name slug description color icon')
      .exec(); // ✅ Fixed
  }

  // Create new product
async createProduct(input: CreateProductInput): Promise<IProduct> {
  const {
    name,
    brand,
    description,
    price,
    mainCategory,
    subCategory,
    tagCategories = [],
    stock,
    image,
    images = [],
    featured = false
  } = input;

  // Verify main category exists
  const mainCat = await Category.findById(mainCategory);
  if (!mainCat) {
    throw new Error('Main category not found');
  }

  // Verify subcategory exists (if provided)
  if (subCategory) {
    const subCat = await Category.findById(subCategory);
    if (!subCat) {
      throw new Error('Subcategory not found');
    }
  }

  // Verify tag categories exist (if provided)
  if (tagCategories.length > 0) {
    const foundTags = await TagCategory.find({ _id: { $in: tagCategories } });
    if (foundTags.length !== tagCategories.length) {
      throw new Error('One or more tag categories not found');
    }
  }

  // ✅ ✅ ✅ CRITICAL: DO NOT AWAIT UNTIL .exec()
  const product = await (Product.create({
    name,
    brand,
    description,
    price,
    mainCategory,
    subCategory,
    tagCategories,
    stock,
    image,
    images,
    featured
  })as any)
    .populate('mainCategory', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('tagCategories', 'name slug color icon')
    .exec();

  // Update product counts
  await this.updateCategoryProductCount(mainCategory);
  if (subCategory) {
    await this.updateCategoryProductCount(subCategory);
  }

  return product;
}

  // Update product
  async updateProduct(id: string, input: UpdateProductInput): Promise<IProduct | null> {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Verify main category (if changing)
    if (input.mainCategory) {
      const mainCat = await Category.findById(input.mainCategory);
      if (!mainCat) {
        throw new Error('Main category not found');
      }
    }

    // Verify subcategory (if changing)
    if (input.subCategory) {
      const subCat = await Category.findById(input.subCategory);
      if (!subCat) {
        throw new Error('Subcategory not found');
      }
    }

    // Verify tag categories (if changing)
    if (input.tagCategories) {
      if (input.tagCategories.length > 0) {
        const foundTags = await TagCategory.find({ _id: { $in: input.tagCategories } });
        if (foundTags.length !== input.tagCategories.length) {
          throw new Error('One or more tag categories not found');
        }
      }
    }

    // ✅ Populate after update — with .exec()
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      input,
      { new: true, runValidators: true }
    )
      .populate('mainCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('tagCategories', 'name slug color icon')
      .exec(); // ✅ Fixed — added .exec()

    if (!updatedProduct) return null;

    // Update category counts if mainCategory or subCategory changed
    const oldMain = product.mainCategory.toString();
    const newMain = input.mainCategory || oldMain;
    const oldSub = product.subCategory?.toString();
    const newSub = input.subCategory || oldSub;

    if (newMain !== oldMain) {
      await this.updateCategoryProductCount(oldMain);
      await this.updateCategoryProductCount(newMain);
    }

    if (newSub !== oldSub) {
      if (oldSub) await this.updateCategoryProductCount(oldSub);
      if (newSub) await this.updateCategoryProductCount(newSub);
    }

    return updatedProduct;
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const result = await Product.findByIdAndDelete(id);
    
    if (result) {
      // Update category counts
      await this.updateCategoryProductCount(product.mainCategory.toString());
      if (product.subCategory) {
        await this.updateCategoryProductCount(product.subCategory.toString());
      }
    }

    return !!result;
  }

  // Search products
  async searchProducts(query: string): Promise<IProduct[]> {
    return await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('mainCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('tagCategories', 'name slug color icon')
      .sort({ createdAt: -1 })
      .exec(); // ✅ Fixed
  }

  // Update category product count (used as main OR sub)
  private async updateCategoryProductCount(categoryId: string): Promise<void> {
    const productCount = await Product.countDocuments({
      $or: [
        { mainCategory: categoryId },
        { subCategory: categoryId }
      ],
      isActive: true
    });
    
    await Category.findByIdAndUpdate(categoryId, { productCount });
  }

  // Get products with pagination
  async getProductsPaginated(
    page: number = 1, 
    limit: number = 10, 
    filters: ProductFilters = {}
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const query: any = { isActive: true };

    // Apply filters
    if (filters.mainCategory) query.mainCategory = filters.mainCategory;
    if (filters.subCategory) query.subCategory = filters.subCategory;
    if (filters.tagCategories && filters.tagCategories.length > 0) {
      query.tagCategories = { $in: filters.tagCategories };
    }
    if (filters.featured !== undefined) query.featured = filters.featured;
    if (filters.search) query.$text = { $search: filters.search };
    if (filters.brand) query.brand = { $regex: filters.brand, $options: 'i' };

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('mainCategory', 'name slug')
        .populate('subCategory', 'name slug')
        .populate('tagCategories', 'name slug color icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(), // ✅ Fixed — added .exec()
      Product.countDocuments(query)
    ]);

    return {
      products,
      total,
      pages: Math.ceil(total / limit)
    };
  }
}