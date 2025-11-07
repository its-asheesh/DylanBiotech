// src/pages/AddProduct.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSave,
  FiX,
  FiImage,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { createProduct, type CreateProductData } from '../services/productApi';
import { getMainCategories, getSubCategories, type Category } from '../services/categoryApi';
import { getActiveTagCategories, type TagCategory } from '../services/tagCategoryApi';

interface FormErrors {
  [key: string]: string;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    brand: '',
    description: '',
    price: 0,
    mainCategory: '',
    subCategory: '',
    tagCategories: [],
    stock: 0,
    image: '',
    images: [],
    isActive: true,
    featured: false,
  });

  // Dropdown data
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Load dropdown data
  useEffect(() => {
    async function loadData() {
      try {
        const [mainCats, tagCats] = await Promise.all([
          getMainCategories(),
          getActiveTagCategories(),
        ]);
        setMainCategories(mainCats);
        setTagCategories(tagCats);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
        setError('Failed to load form data. Please refresh the page.');
      }
    }
    loadData();
  }, []);

  // Load sub categories when main category changes
  useEffect(() => {
    async function loadSubCategories() {
      if (formData.mainCategory) {
        try {
          const subs = await getSubCategories(formData.mainCategory);
          setSubCategories(subs);
          // Reset sub category if it's not in the new list
          if (formData.subCategory && !subs.find((s) => s._id === formData.subCategory)) {
            setFormData((prev) => ({ ...prev, subCategory: '' }));
          }
        } catch (err) {
          console.error('Failed to load sub categories:', err);
        }
      } else {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    }
    loadSubCategories();
  }, [formData.mainCategory]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Product name cannot exceed 200 characters';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    } else if (formData.brand.trim().length > 100) {
      newErrors.brand = 'Brand name cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = 'Description cannot exceed 5000 characters';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be positive';
    } else if (formData.price > 1000000) {
      newErrors.price = 'Price cannot exceed $1,000,000';
    }

    if (!formData.mainCategory) {
      newErrors.mainCategory = 'Main category is required';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (formData.stock > 1000000) {
      newErrors.stock = 'Stock cannot exceed 1,000,000';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Main image URL is required';
    } else if (!isValidImageUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }

    // Validate additional images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img, index) => {
        if (!isValidImageUrl(img)) {
          newErrors[`images.${index}`] = 'Please enter a valid image URL';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate image URL
  const isValidImageUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        (url.includes('cloudinary') ||
          url.includes('data:image') ||
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url))
      );
    } catch {
      return false;
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle tag category toggle
  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const currentTags = prev.tagCategories || [];
      const newTags = currentTags.includes(tagId)
        ? currentTags.filter((id) => id !== tagId)
        : [...currentTags, tagId];

      // Limit to 20 tags
      if (newTags.length > 20) {
        setError('Cannot select more than 20 tag categories');
        return prev;
      }

      return { ...prev, tagCategories: newTags };
    });
  };

  // Add additional image
  const handleAddImage = () => {
    if (formData.images && formData.images.length >= 10) {
      setError('Cannot add more than 10 images');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ''],
    }));
  };

  // Remove additional image
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  // Update additional image URL
  const handleImageUrlChange = (index: number, url: string) => {
    setFormData((prev) => {
      const newImages = [...(prev.images || [])];
      newImages[index] = url;
      return { ...prev, images: newImages };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const submitData: CreateProductData = {
        ...formData,
        subCategory: formData.subCategory || undefined,
        images: formData.images && formData.images.length > 0 ? formData.images : undefined,
        tagCategories:
          formData.tagCategories && formData.tagCategories.length > 0
            ? formData.tagCategories
            : undefined,
      };

      await createProduct(submitData);
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-600 mt-1">Fill in the details to create a new product</p>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <FiX className="text-lg" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-green-600 text-xl" />
            <div>
              <h3 className="text-green-900 font-semibold">Product created successfully!</h3>
              <p className="text-green-700 text-sm mt-1">Redirecting to products list...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-red-600 text-xl" />
            <div>
              <h3 className="text-red-900 font-semibold">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {/* Basic Information */}
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.name ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter product name"
                maxLength={200}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-slate-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.brand ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter brand name"
                maxLength={100}
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.brand}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="1000000"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.price ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                max="1000000"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.stock ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.stock}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter product description (minimum 10 characters)"
                maxLength={5000}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="text-xs" />
                    {errors.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    {formData.description.length}/5000 characters
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Category */}
            <div>
              <label
                htmlFor="mainCategory"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Main Category <span className="text-red-500">*</span>
              </label>
              <select
                id="mainCategory"
                name="mainCategory"
                value={formData.mainCategory}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.mainCategory ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Select main category</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.mainCategory && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.mainCategory}
                </p>
              )}
            </div>

            {/* Sub Category */}
            <div>
              <label
                htmlFor="subCategory"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Sub Category <span className="text-slate-400">(Optional)</span>
              </label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                disabled={!formData.mainCategory || subCategories.length === 0}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.subCategory
                    ? 'border-red-300'
                    : 'border-slate-300'
                } ${!formData.mainCategory || subCategories.length === 0 ? 'bg-slate-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!formData.mainCategory
                    ? 'Select main category first'
                    : subCategories.length === 0
                    ? 'No sub categories available'
                    : 'Select sub category'}
                </option>
                {subCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.subCategory && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="text-xs" />
                  {errors.subCategory}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tag Categories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Tag Categories</h2>
          <p className="text-sm text-slate-600 mb-4">
            Select tag categories (e.g., Best Seller, New Arrival) - Optional
          </p>
          <div className="flex flex-wrap gap-3">
            {tagCategories.map((tag) => {
              const isSelected = formData.tagCategories?.includes(tag._id);
              return (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => handleTagToggle(tag._id)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          {formData.tagCategories && formData.tagCategories.length > 0 && (
            <p className="mt-4 text-sm text-slate-600">
              {formData.tagCategories.length} tag{formData.tagCategories.length !== 1 ? 's' : ''}{' '}
              selected
            </p>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Images</h2>

          {/* Main Image */}
          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
              Main Image URL <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.image ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="text-xs" />
                    {errors.image}
                  </p>
                )}
              </div>
              {formData.image && isValidImageUrl(formData.image) && (
                <div className="w-24 h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Additional Images <span className="text-slate-400">(Optional, max 10)</span>
              </label>
              <button
                type="button"
                onClick={handleAddImage}
                disabled={(formData.images?.length || 0) >= 10}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="text-base" />
                Add Image
              </button>
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className="space-y-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors[`images.${index}`] ? 'border-red-300' : 'border-slate-300'
                        }`}
                        placeholder="https://example.com/image.jpg"
                      />
                      {errors[`images.${index}`] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <FiAlertCircle className="text-xs" />
                          {errors[`images.${index}`]}
                        </p>
                      )}
                    </div>
                    {img && isValidImageUrl(img) && (
                      <div className="w-24 h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Options */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Status Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Active</span>
                <p className="text-xs text-slate-500">Product will be visible to customers</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Featured</span>
                <p className="text-xs text-slate-500">Show this product as featured</p>
              </div>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiSave className="text-lg" />
                <span>Create Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
