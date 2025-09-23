export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  slug: string;
  isActive: boolean;
  featured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
  image?: string;
  featured?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  featured?: boolean;
} 