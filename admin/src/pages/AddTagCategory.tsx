// src/pages/AddTagCategory.tsx
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
  FiTag,
} from 'react-icons/fi';
import {
  createTagCategoryWithFile,
  createTagCategory,
  updateTagCategoryWithFile,
  updateTagCategory,
  getTagCategoryById,
  type TagCategory,
  type CreateTagCategoryData,
  type UpdateTagCategoryData,
} from '../services/tagCategoryApi';

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

function isValidColor(color: string): boolean {
  // Check if it's a valid hex color or a valid color name
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colorNamePattern = /^[a-zA-Z]+$/;
  return hexPattern.test(color) || colorNamePattern.test(color);
}

const PRESET_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Gray', value: '#6b7280' },
];

export default function AddTagCategory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!tagId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateTagCategoryData>({
    name: '',
    description: '',
    color: '',
    icon: '',
    isActive: true,
  });

  // File upload
  const [iconFile, setIconFile] = useState<File | null>(null);

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Load tag if editing
  useEffect(() => {
    async function loadTag() {
      if (!tagId) {
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        setError(null);
        const tag = await getTagCategoryById(tagId);
        if (!tag) {
          setError('Tag category not found');
          navigate('/admin/tag-categories');
          return;
        }

        setFormData({
          name: tag.name,
          description: tag.description || '',
          color: tag.color || '',
          icon: tag.icon || '',
          isActive: tag.isActive,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load tag category';
        setError(errorMessage);
        console.error('Error loading tag category:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    loadTag();
  }, [tagId, navigate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  // Handle color preset selection
  const handleColorPreset = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    if (errors.color) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.color;
        return newErrors;
      });
    }
  };

  // Handle icon file upload
  const handleIconFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIconFile(file);
      // Clear URL if file is selected
      setFormData((prev) => ({ ...prev, icon: '' }));
      if (errors.icon) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.icon;
          return newErrors;
        });
      }
    }
  };

  // Handle icon URL change
  const handleIconUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, icon: url }));
    // Clear file if URL is provided
    if (url) {
      setIconFile(null);
    }
    if (errors.icon) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.icon;
        return newErrors;
      });
    }
  };

  // Get icon preview URL
  const getIconPreview = (): string | null => {
    if (iconFile) {
      return URL.createObjectURL(iconFile);
    }
    if (formData.icon && isValidImageUrl(formData.icon)) {
      return formData.icon;
    }
    return null;
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Tag name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.name.trim())) {
      newErrors.name = 'Tag name can only contain letters, numbers, spaces, and hyphens';
    }

    if (formData.description && formData.description.trim().length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    if (formData.color && formData.color.trim() && !isValidColor(formData.color.trim())) {
      newErrors.color = 'Color must be a valid hex code (e.g., #FF5733) or color name';
    }

    if (formData.icon && formData.icon.trim() && !isValidImageUrl(formData.icon.trim())) {
      newErrors.icon = 'Please enter a valid icon URL';
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

      if (iconFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        if (formData.description) {
          formDataToSend.append('description', formData.description.trim());
        }
        if (formData.color) {
          formDataToSend.append('color', formData.color.trim());
        }
        formDataToSend.append('isActive', (formData.isActive ?? true).toString());
        formDataToSend.append('icon', iconFile);

        if (tagId) {
          await updateTagCategoryWithFile(tagId, formDataToSend);
        } else {
          await createTagCategoryWithFile(formDataToSend);
        }
      } else {
        // Use JSON for URL-only
        const dataToSend: CreateTagCategoryData | UpdateTagCategoryData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          color: formData.color?.trim() || undefined,
          isActive: formData.isActive ?? true,
        };

        if (formData.icon) {
          dataToSend.icon = formData.icon.trim();
        }

        if (tagId) {
          await updateTagCategory(tagId, dataToSend);
        } else {
          await createTagCategory(dataToSend);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/tag-categories');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save tag category';
      setError(errorMessage);
      console.error('Error saving tag category:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tag category...</p>
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
            {tagId ? 'Edit Tag Category' : 'Add Tag Category'}
          </h1>
          <p className="text-slate-600 mt-1">
            {tagId ? 'Update tag category information' : 'Create a new product tag (e.g., Best Seller, New Arrival)'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/tag-categories')}
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
                Tag category {tagId ? 'updated' : 'created'} successfully. Redirecting...
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
              Tag Name <span className="text-red-500">*</span>
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
              placeholder="e.g., Best Seller, New Arrival, Sale"
              maxLength={50}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            <p className="mt-1 text-xs text-slate-500">{formData.name.length}/50 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Optional description for this tag..."
              maxLength={200}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-slate-500">
              {formData.description.length}/200 characters
            </p>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Color</h2>

          {/* Color Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleColorPreset(preset.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    formData.color === preset.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: preset.value }}
                  ></div>
                  <span className="text-sm text-slate-700">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-2">
              Custom Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.color ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="#FF5733 or red"
              />
              {formData.color && isValidColor(formData.color) && (
                <div
                  className="w-12 h-12 rounded-lg border-2 border-slate-300"
                  style={{
                    backgroundColor: formData.color.startsWith('#') ? formData.color : undefined,
                  }}
                ></div>
              )}
            </div>
            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
            <p className="mt-1 text-xs text-slate-500">
              Enter a hex color code (e.g., #FF5733) or color name (e.g., red, blue)
            </p>
          </div>
        </div>

        {/* Icon */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Icon</h2>

          {/* Icon Preview */}
          {getIconPreview() && (
            <div className="relative w-24 h-24 border border-slate-300 rounded-lg overflow-hidden">
              <img
                src={getIconPreview()!}
                alt="Icon preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setIconFile(null);
                  setFormData((prev) => ({ ...prev, icon: '' }));
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Icon</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors">
                <FiUpload className="text-lg" />
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconFile}
                  className="hidden"
                />
              </label>
              {iconFile && <span className="text-sm text-slate-600">{iconFile.name}</span>}
            </div>
            <p className="mt-1 text-xs text-slate-500">Max size: 10MB. Supported formats: JPG, PNG, GIF, SVG</p>
          </div>

          {/* Or Icon URL */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">OR</span>
            </div>
            <div className="border-t border-slate-300 my-4"></div>
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-slate-700 mb-2">
              Icon URL
            </label>
            <div className="relative">
              <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={(e) => handleIconUrlChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.icon ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="https://example.com/icon.svg"
              />
            </div>
            {errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon}</p>}
            <p className="mt-1 text-xs text-slate-500">Enter a direct URL to an icon image</p>
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
              Tag category is active (visible to customers)
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/admin/tag-categories')}
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
                {tagId ? 'Update Tag Category' : 'Create Tag Category'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
