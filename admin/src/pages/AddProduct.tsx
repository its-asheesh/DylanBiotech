// src/pages/AddProduct.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { createProductWithFiles, type CreateProductData, createVariantWithFiles } from '../services/productApi';
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

  // File uploads
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [variantImageFiles, setVariantImageFiles] = useState<{ [key: number]: File | null }>({});

  // Dropdown data
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Variant state
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsExpanded, setVariantsExpanded] = useState(false);
  const [variants, setVariants] = useState<Array<{
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
    image: string;
    isActive: boolean;
    errors?: FormErrors;
  }>>([]);


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

    const stockValue = formData.stock ?? 0;
    if (stockValue < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (stockValue > 1000000) {
      newErrors.stock = 'Stock cannot exceed 1,000,000';
    }

    // Main image validation - either file or URL required
    if (!mainImageFile && !formData.image.trim()) {
      newErrors.image = 'Main image is required (upload file or provide URL)';
    } else if (!mainImageFile && formData.image.trim() && !isValidImageUrl(formData.image)) {
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
    if ((formData.images?.length || 0) >= 10) {
      setError('Cannot add more than 10 images');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ''],
    }));
    // Add empty slot for file
    setAdditionalImageFiles((prev) => [...prev, null as any].filter(f => f !== null));
  };

  // Remove additional image
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
    // Remove corresponding file
    setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Update additional image URL
  const handleImageUrlChange = (index: number, url: string) => {
    setFormData((prev) => {
      const newImages = [...(prev.images || [])];
      newImages[index] = url;
      return { ...prev, images: newImages };
    });
    // Clear file if URL is provided
    setAdditionalImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = null as any;
      return newFiles.filter(f => f !== null);
    });
  };

  // Handle main image file upload
  const handleMainImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setMainImageFile(file);
      // Clear URL if file is selected
      setFormData((prev) => ({ ...prev, image: '' }));
    }
  };

  // Handle additional image file upload
  const handleAdditionalImageFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAdditionalImageFiles((prev) => {
        const newFiles = [...prev];
        // Ensure array is long enough
        while (newFiles.length <= index) {
          newFiles.push(null as any);
        }
        newFiles[index] = file;
        return newFiles;
      });
      // Clear URL if file is selected
      handleImageUrlChange(index, '');
    }
  };

  // Handle variant image file upload
  const handleVariantImageFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
      setVariantImageFiles((prev) => ({ ...prev, [index]: file }));
      // Clear URL if file is selected
      handleVariantChange(index, 'image', '');
    }
  };

  // Get image preview URL (for file or URL)
  const getImagePreview = (file: File | null, url: string): string | null => {
    if (file) {
      return URL.createObjectURL(file);
    }
    if (url && isValidImageUrl(url)) {
      return url;
    }
    return null;
  };

  // Generate SKU from product name and variant attributes
  const generateSKU = (variantIndex: number): string => {
    const variant = variants[variantIndex];
    if (!variant) return '';

    const baseName = formData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    
    const attrValues = Object.values(variant.attributes)
      .map(val => val.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3))
      .join('-');
    
    return `${baseName}-${attrValues || 'VAR'}-${variantIndex + 1}`.substring(0, 50);
  };

  // Add new variant
  const handleAddVariant = () => {
    const newVariant = {
      name: '',
      sku: '',
      price: formData.price || 0,
      stock: 0,
      attributes: { Color: '', Size: '' },
      image: '',
      isActive: true,
    };
    setVariants([...variants, newVariant]);
    setVariantsExpanded(true);
  };

  // Remove variant
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Update variant field
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Update variant attribute
  const handleVariantAttributeChange = (index: number, key: string, value: string) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      attributes: { ...updated[index].attributes, [key]: value },
    };
    // Auto-update variant name if attributes change
    const attrString = Object.entries(updated[index].attributes)
      .filter(([_k, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    if (attrString) {
      updated[index].name = `${formData.name} - ${attrString}`;
    }
    setVariants(updated);
  };

  // Add custom attribute to variant
  const handleAddAttribute = (index: number) => {
    const key = prompt('Enter attribute name (e.g., Material, Style):');
    if (key && key.trim()) {
      handleVariantAttributeChange(index, key.trim(), '');
    }
  };

  // Remove attribute from variant
  const handleRemoveAttribute = (index: number, key: string) => {
    const updated = [...variants];
    const newAttributes = { ...updated[index].attributes };
    delete newAttributes[key];
    updated[index] = { ...updated[index], attributes: newAttributes };
    setVariants(updated);
  };

  // Auto-generate SKU for variant
  const handleGenerateSKU = (index: number) => {
    const sku = generateSKU(index);
    handleVariantChange(index, 'sku', sku);
  };

  // Validate variants
  const validateVariants = (): boolean => {
    if (!hasVariants || variants.length === 0) return true;

    let isValid = true;
    const newVariantErrors: FormErrors[] = [];

    variants.forEach((variant, index) => {
      const variantErrors: FormErrors = {};

      if (!variant.name.trim()) {
        variantErrors.name = 'Variant name is required';
        isValid = false;
      }

      if (!variant.sku.trim()) {
        variantErrors.sku = 'SKU is required';
        isValid = false;
      } else if (!/^[A-Z0-9-_]+$/.test(variant.sku)) {
        variantErrors.sku = 'SKU can only contain uppercase letters, numbers, hyphens, and underscores';
        isValid = false;
      }

      if (variant.price < 0) {
        variantErrors.price = 'Price must be positive';
        isValid = false;
      }

      if (variant.stock < 0) {
        variantErrors.stock = 'Stock cannot be negative';
        isValid = false;
      }

      // Check for duplicate SKUs
      const duplicateIndex = variants.findIndex((v, i) => i !== index && v.sku === variant.sku);
      if (duplicateIndex !== -1) {
        variantErrors.sku = 'SKU must be unique';
        isValid = false;
      }

      newVariantErrors.push(variantErrors);
    });

    // Update variants with errors
    setVariants(variants.map((v, i) => ({ ...v, errors: newVariantErrors[i] })));

    return isValid;
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

    // Validate variants if enabled
    if (hasVariants && !validateVariants()) {
      setError('Please fix the errors in the variants');
      setVariantsExpanded(true);
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('brand', formData.brand.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('mainCategory', formData.mainCategory);
      if (formData.subCategory) {
        formDataToSend.append('subCategory', formData.subCategory);
      }
      formDataToSend.append('stock', (formData.stock || 0).toString());
      formDataToSend.append('isActive', (formData.isActive ?? true).toString());
      formDataToSend.append('featured', (formData.featured ?? false).toString());

      // Add tag categories
      if (formData.tagCategories && formData.tagCategories.length > 0) {
        formDataToSend.append('tagCategories', JSON.stringify(formData.tagCategories));
      }

      // Add main image file or URL
      if (mainImageFile) {
        formDataToSend.append('image', mainImageFile);
      } else if (formData.image.trim()) {
        formDataToSend.append('image', formData.image.trim());
      }

      // Add additional image files
      additionalImageFiles.forEach((file) => {
        if (file) {
          formDataToSend.append('images', file);
        }
      });
      
      // Add URL images (only if no file was uploaded for that index)
      if (formData.images && formData.images.length > 0) {
        const urlImages = formData.images
          .map((url, index) => ({ url: url.trim(), index }))
          .filter(({ url, index }) => url && !additionalImageFiles[index])
          .map(({ url }) => url);
        
        if (urlImages.length > 0) {
          formDataToSend.append('images', JSON.stringify(urlImages));
        }
      }

      // Create product first using FormData
      const createdProduct = await createProductWithFiles(formDataToSend);

      // Create variants if any
      if (hasVariants && variants.length > 0) {
        const variantPromises = variants.map((variant, index) => {
          const variantFormData = new FormData();
          variantFormData.append('product', createdProduct._id);
          variantFormData.append('name', variant.name.trim());
          variantFormData.append('sku', variant.sku.trim().toUpperCase());
          variantFormData.append('price', variant.price.toString());
          variantFormData.append('stock', variant.stock.toString());
          variantFormData.append('isActive', variant.isActive.toString());
          
          const attributes = Object.fromEntries(
            Object.entries(variant.attributes).filter(([_k, v]) => v.trim())
          );
          variantFormData.append('attributes', JSON.stringify(attributes));

          // Add variant image file or URL
          if (variantImageFiles[index]) {
            variantFormData.append('image', variantImageFiles[index]!);
          } else if (variant.image.trim()) {
            variantFormData.append('image', variant.image.trim());
          }

          return createVariantWithFiles(variantFormData);
        });

        await Promise.all(variantPromises);
      }

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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Main Image <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* File Upload */}
              <div>
                <label className="block text-xs text-slate-600 mb-1">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageFile}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                {mainImageFile && (
                  <p className="mt-1 text-xs text-slate-600">Selected: {mainImageFile.name}</p>
                )}
              </div>
              
              {/* OR Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-slate-300"></div>
                <span className="text-xs text-slate-500">OR</span>
                <div className="flex-1 border-t border-slate-300"></div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs text-slate-600 mb-1">Or Enter Image URL</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      disabled={!!mainImageFile}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.image ? 'border-red-300' : 'border-slate-300'
                      } ${mainImageFile ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="text-xs" />
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {getImagePreview(mainImageFile, formData.image) && (
                <div className="w-32 h-32 rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                  <img
                    src={getImagePreview(mainImageFile, formData.image)!}
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

            {formData.images && formData.images.length > 0 ? (
              <div className="space-y-4">
                {formData.images.map((_, index) => (
                  <div key={index} className="space-y-2 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Image {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveImage(index);
                          setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                    
                    {/* File Upload */}
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Upload File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAdditionalImageFile(index, e)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      {additionalImageFiles[index] && (
                        <p className="mt-1 text-xs text-slate-600">Selected: {additionalImageFiles[index]?.name}</p>
                      )}
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-slate-300"></div>
                      <span className="text-xs text-slate-500">OR</span>
                      <div className="flex-1 border-t border-slate-300"></div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Or Enter URL</label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={formData.images?.[index] || ''}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            disabled={!!additionalImageFiles[index]}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors[`images.${index}`] ? 'border-red-300' : 'border-slate-300'
                            } ${additionalImageFiles[index] ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                            placeholder="https://example.com/image.jpg"
                          />
                          {errors[`images.${index}`] && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <FiAlertCircle className="text-xs" />
                              {errors[`images.${index}`]}
                            </p>
                          )}
                        </div>
                        {getImagePreview(additionalImageFiles[index] || null, formData.images?.[index] || '') && (
                          <div className="w-24 h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                            <img
                              src={getImagePreview(additionalImageFiles[index] || null, formData.images?.[index] || '')!}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Product Variants</h2>
              <p className="text-sm text-slate-600 mt-1">
                Add variants with different colors, sizes, or other attributes (e.g., Red - Large, Blue - Medium)
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => {
                  setHasVariants(e.target.checked);
                  if (e.target.checked) {
                    setVariantsExpanded(true);
                    if (variants.length === 0) {
                      handleAddVariant();
                    }
                  }
                }}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Enable Variants</span>
            </label>
          </div>

          {hasVariants && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setVariantsExpanded(!variantsExpanded)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {variantsExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  <span>{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="text-base" />
                  Add Variant
                </button>
              </div>

              {variantsExpanded && variants.length > 0 && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">
                          Variant {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Variant Name */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Variant Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              variant.errors?.name ? 'border-red-300' : 'border-slate-300'
                            }`}
                            placeholder="e.g., Red - Large, Blue - Medium"
                          />
                          {variant.errors?.name && (
                            <p className="mt-1 text-sm text-red-600">{variant.errors.name}</p>
                          )}
                        </div>

                        {/* SKU */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            SKU <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value.toUpperCase())}
                              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                variant.errors?.sku ? 'border-red-300' : 'border-slate-300'
                              }`}
                              placeholder="PROD-RED-LRG-01"
                              style={{ textTransform: 'uppercase' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleGenerateSKU(index)}
                              className="px-3 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                              title="Auto-generate SKU"
                            >
                              <FiRefreshCw className="text-base" />
                            </button>
                          </div>
                          {variant.errors?.sku && (
                            <p className="mt-1 text-sm text-red-600">{variant.errors.sku}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Price ($) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              variant.errors?.price ? 'border-red-300' : 'border-slate-300'
                            }`}
                            placeholder="0.00"
                          />
                          {variant.errors?.price && (
                            <p className="mt-1 text-sm text-red-600">{variant.errors.price}</p>
                          )}
                        </div>

                        {/* Stock */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Stock <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                            min="0"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              variant.errors?.stock ? 'border-red-300' : 'border-slate-300'
                            }`}
                            placeholder="0"
                          />
                          {variant.errors?.stock && (
                            <p className="mt-1 text-sm text-red-600">{variant.errors.stock}</p>
                          )}
                        </div>

                        {/* Variant Image */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Variant Image <span className="text-slate-400">(Optional)</span>
                          </label>
                          <div className="space-y-3">
                            {/* File Upload */}
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Upload Image File</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleVariantImageFile(index, e)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              />
                              {variantImageFiles[index] && (
                                <p className="mt-1 text-xs text-slate-600">Selected: {variantImageFiles[index]?.name}</p>
                              )}
                            </div>

                            {/* OR Divider */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 border-t border-slate-300"></div>
                              <span className="text-xs text-slate-500">OR</span>
                              <div className="flex-1 border-t border-slate-300"></div>
                            </div>

                            {/* URL Input */}
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Or Enter Image URL</label>
                              <div className="flex gap-4">
                                <input
                                  type="url"
                                  value={variant.image}
                                  onChange={(e) => handleVariantChange(index, 'image', e.target.value)}
                                  disabled={!!variantImageFiles[index]}
                                  className={`flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    variantImageFiles[index] ? 'bg-slate-50 cursor-not-allowed' : ''
                                  }`}
                                  placeholder="https://example.com/variant-image.jpg"
                                />
                                {getImagePreview(variantImageFiles[index] || null, variant.image) && (
                                  <div className="w-24 h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                                    <img
                                      src={getImagePreview(variantImageFiles[index] || null, variant.image)!}
                                      alt="Variant preview"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Attributes */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Attributes (Color, Size, etc.)
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddAttribute(index)}
                              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <FiPlus className="text-xs" />
                              Add Attribute
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <input
                                  type="text"
                                  value={key}
                                  readOnly
                                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-sm font-medium"
                                />
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handleVariantAttributeChange(index, key, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                  placeholder={key === 'Color' ? 'Red' : key === 'Size' ? 'Large' : 'Value'}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttribute(index, key)}
                                  className="text-red-600 hover:text-red-700 p-2"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Common attributes: Color, Size, Material, Style, Pattern
                          </p>
                        </div>

                        {/* Active Status */}
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                              className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Active (visible to customers)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {variants.length === 0 && (
                <div className="text-center py-8 border-t border-slate-200">
                  <p className="text-slate-600 mb-4">No variants added yet</p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add First Variant
                  </button>
                </div>
              )}
            </div>
          )}
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
