// src/pages/Products.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiStar,
  FiPackage,
} from 'react-icons/fi';
import { listProducts, deleteProduct, type Product, type ListProductsParams } from '../services/productApi';
import { listCategories, type Category } from '../services/categoryApi';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  
  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load products
  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, selectedBrand, featuredFilter]);

  // Load categories for filter
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await listCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Extract unique brands from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();
      setBrands(uniqueBrands);
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: ListProductsParams = {
        page,
        limit,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedBrand && { brand: selectedBrand }),
        ...(featuredFilter !== null && { featured: featuredFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await listProducts(params);
      setProducts(response.products);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        // Reset to page 1 when searching
        setPage(1);
        loadProducts();
      } else {
        loadProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteProduct(id);
      // Reload products
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setFeaturedFilter(null);
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory || selectedBrand || featuredFilter !== null || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">Manage all your products</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <FiPlus className="text-lg" />
          Add Product
        </button>
      </div>

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

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name, brand, or description..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiFilter className="text-lg" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {[selectedCategory, selectedBrand, featuredFilter !== null, searchTerm].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors"
            >
              <FiX className="text-lg" />
              Clear
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Featured</label>
              <select
                value={featuredFilter === null ? '' : featuredFilter.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFeaturedFilter(value === '' ? null : value === 'true');
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Products</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-4xl text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first product'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={() => navigate('/admin/products/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus className="text-lg" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                              {product.featured && (
                                <FiStar className="text-yellow-500 flex-shrink-0" title="Featured" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-1">
                              {product.description.substring(0, 50)}
                              {product.description.length > 50 ? '...' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{product.brand}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {typeof product.mainCategory === 'object' && product.mainCategory
                            ? (product.mainCategory as any).name
                            : product.mainCategory || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">${product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            product.stock < 10 ? 'text-red-600' : product.stock < 50 ? 'text-orange-600' : 'text-green-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${product._id}`)}
                            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            disabled={deletingId === product._id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === product._id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FiTrash2 className="text-lg" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft className="text-lg" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight className="text-lg" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
