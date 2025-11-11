// src/pages/TagCategories.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiTag,
} from 'react-icons/fi';
import {
  listTagCategories,
  deleteTagCategory,
  updateTagCategory,
  type TagCategory,
} from '../services/tagCategoryApi';

export default function TagCategories() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagCategory[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Load tags
  useEffect(() => {
    loadTags();
  }, []);

  // Filter tags
  useEffect(() => {
    let filtered = [...tags];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tag.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter((tag) => tag.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((tag) => !tag.isActive);
    }

    setFilteredTags(filtered);
  }, [tags, searchTerm, filterStatus]);

  async function loadTags() {
    try {
      setLoading(true);
      setError(null);
      // Load all tags (both active and inactive) for admin
      const data = await listTagCategories({ all: true });
      setTags(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tag categories';
      setError(errorMessage);
      console.error('Error loading tag categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteTagCategory(id);
      await loadTags();
      setShowDeleteConfirm(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tag category';
      setError(errorMessage);
      console.error('Error deleting tag category:', err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(tag: TagCategory) {
    try {
      setUpdatingId(tag._id);
      await updateTagCategory(tag._id, { isActive: !tag.isActive });
      await loadTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tag category';
      setError(errorMessage);
      console.error('Error updating tag category:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleEdit(id: string) {
    navigate(`/admin/tag-categories/new?id=${id}`);
  }

  function getColorDisplay(color?: string): string {
    if (!color) return 'No color';
    if (color.startsWith('#')) return color;
    return color.charAt(0).toUpperCase() + color.slice(1);
  }

  if (loading && tags.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tag categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tag Categories</h1>
          <p className="text-slate-600 mt-1">Manage product tags (Best Seller, New Arrival, etc.)</p>
        </div>
        <button
          onClick={() => navigate('/admin/tag-categories/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="text-lg" />
          Add Tag Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-red-600 text-xl" />
              <div>
                <h3 className="text-red-900 font-semibold">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tag categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredTags.length} of {tags.length} tag categories
          </p>
          <button
            onClick={loadTags}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tags Table */}
      {filteredTags.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FiTag className="text-4xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No tag categories found</h3>
          <p className="text-slate-600 mb-4">
            {tags.length === 0
              ? 'Get started by creating your first tag category'
              : 'Try adjusting your filters'}
          </p>
          {tags.length === 0 && (
            <button
              onClick={() => navigate('/admin/tag-categories/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="text-lg" />
              Add Tag Category
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTags.map((tag) => (
                  <tr key={tag._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {tag.icon ? (
                          <img
                            src={tag.icon}
                            alt={tag.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                            style={{
                              backgroundColor: tag.color || '#6366f1',
                            }}
                          >
                            {tag.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">{tag.name}</div>
                          {tag.description && (
                            <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                              {tag.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tag.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-slate-300"
                            style={{
                              backgroundColor: tag.color.startsWith('#') ? tag.color : undefined,
                            }}
                          ></div>
                          <span className="text-sm text-slate-600">{getColorDisplay(tag.color)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{tag.productCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(tag)}
                        disabled={updatingId === tag._id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          tag.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } disabled:opacity-50`}
                      >
                        {updatingId === tag._id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            Updating...
                          </>
                        ) : tag.isActive ? (
                          <>
                            <FiCheckCircle className="text-xs" />
                            Active
                          </>
                        ) : (
                          <>
                            <FiX className="text-xs" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {tag.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag._id)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm({ id: tag._id, name: tag.name })}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiAlertCircle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Delete Tag Category</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                disabled={deletingId === showDeleteConfirm.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === showDeleteConfirm.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
