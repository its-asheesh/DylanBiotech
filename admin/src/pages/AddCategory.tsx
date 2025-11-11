// src/pages/AddCategory.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiSave,
  FiX,
  FiUpload,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiImage,
} from 'react-icons/fi';
import {
  createCategoryWithFile,
  createCategory,
  updateCategoryWithFile,
  updateCategory,
  getCategoryById,
  listCategories,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '../services/categoryApi';

interface FormErrors {
  [key: string]: string;
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AddCategory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!categoryId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    image: '',
    isMain: true,
    parent: undefined,
    isActive: true,
  });

  // File upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Load category if editing
  useEffect(() => {
    async function loadCategory() {
      if (!categoryId) {
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        setError(null);
        const category = await getCategoryById(categoryId);
        if (!category) {
          setError('Category not found');
          navigate('/admin/categories');
          return;
        }

        setFormData({
          name: category.name,
          description: category.description || '',
          image: category.image || '',
          isMain: category.isMain,
          parent: category.parent || category.parentCategory,
          isActive: category.isActive,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load category';
        setError(errorMessage);
        console.error('Error loading category:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    loadCategory();
  }, [categoryId, navigate]);

  // Load main categories for parent dropdown
  useEffect(() => {
    async function loadMainCategories() {
      try {
        const allCategories = await listCategories();
        const mains = allCategories.filter((cat) => cat.isMain && cat.isActive);
        setMainCategories(mains);
      } catch (err) {
        console.error('Failed to load main categories:', err);
      }
    }
    loadMainCategories();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value) || 0
          : name === 'parent' && value === ''
          ? undefined
          : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // If isMain changes, clear parent
    if (name === 'isMain') {
      setFormData((prev) => ({
        ...prev,
        parent: checked ? undefined : prev.parent,
      }));
    }
  };

  // Handle image file upload
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      // Clear URL if file is selected
      setFormData((prev) => ({ ...prev, image: '' }));
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    // Clear file if URL is provided
    if (url) {
      setImageFile(null);
    }
    if (errors.image) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  // Get image preview URL
  const getImagePreview = (): string | null => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    if (formData.image && isValidImageUrl(formData.image)) {
      return formData.image;
    }
    return null;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Category name cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (!formData.isMain && !formData.parent) {
      newErrors.parent = 'Sub categories must have a parent category';
    }

    if (formData.isMain && formData.parent) {
      newErrors.parent = 'Main categories cannot have a parent';
    }

    if (!imageFile && !formData.image) {
      // Image is optional, so we don't require it
    } else if (formData.image && !isValidImageUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);

      if (imageFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('isMain', formData.isMain.toString());
        if (formData.parent) {
          formDataToSend.append('parent', formData.parent);
        }
        formDataToSend.append('isActive', (formData.isActive ?? true).toString());
        formDataToSend.append('image', imageFile);

        if (categoryId) {
          await updateCategoryWithFile(categoryId, formDataToSend);
        } else {
          await createCategoryWithFile(formDataToSend);
        }
      } else {
        // Use JSON for URL-only
        const dataToSend: CreateCategoryData | UpdateCategoryData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          isMain: formData.isMain,
          parent: formData.parent,
          isActive: formData.isActive ?? true,
        };

        if (formData.image) {
          dataToSend.image = formData.image.trim();
        }

        if (categoryId) {
          await updateCategory(categoryId, dataToSend);
        } else {
          await createCategory(dataToSend);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/categories');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category';
      setError(errorMessage);
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {categoryId ? 'Edit Category' : 'Add Category'}
          </h1>
          <p className="text-slate-600 mt-1">
            {categoryId ? 'Update category information' : 'Create a new product category'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/categories')}
          className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <FiX className="text-lg" />
          Cancel
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-green-600 text-xl" />
            <div>
              <h3 className="text-green-900 font-semibold">Success!</h3>
              <p className="text-green-700 text-sm mt-1">
                Category {categoryId ? 'updated' : 'created'} successfully. Redirecting...
              </p>
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
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="e.g., Perfumes, Deodorants"
              maxLength={100}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            <p className="mt-1 text-xs text-slate-500">{formData.name.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Describe this category..."
              maxLength={500}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-slate-500">
              {formData.description.length}/500 characters (minimum 10)
            </p>
          </div>
        </div>

        {/* Category Type */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Category Type</h2>

          {/* Is Main Category */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isMain"
              name="isMain"
              checked={formData.isMain}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isMain" className="text-sm font-medium text-slate-700">
              This is a main category (e.g., Male, Female, Unisex)
            </label>
          </div>

          {/* Parent Category (only if not main) */}
          {!formData.isMain && (
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-slate-700 mb-2">
                Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                id="parent"
                name="parent"
                value={formData.parent || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.parent ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Select a parent category</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.parent && <p className="mt-1 text-sm text-red-600">{errors.parent}</p>}
              {mainCategories.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  No main categories available. Please create a main category first.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Category Image</h2>

          {/* Image Preview */}
          {getImagePreview() && (
            <div className="relative w-48 h-48 border border-slate-300 rounded-lg overflow-hidden">
              <img
                src={getImagePreview()!}
                alt="Category preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setFormData((prev) => ({ ...prev, image: '' }));
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
                <FiUpload className="text-lg" />
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
              {imageFile && <span className="text-sm text-slate-600">{imageFile.name}</span>}
            </div>
            <p className="mt-1 text-xs text-slate-500">Max size: 10MB. Supported formats: JPG, PNG, GIF</p>
          </div>

          {/* Or Image URL */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">OR</span>
            </div>
            <div className="border-t border-slate-300 my-4"></div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
              Image URL
            </label>
            <div className="relative">
              <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.image ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            <p className="mt-1 text-xs text-slate-500">Enter a direct URL to an image</p>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Status</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Category is active (visible to customers)
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                {categoryId ? 'Update Category' : 'Create Category'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
