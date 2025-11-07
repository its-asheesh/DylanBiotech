// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import {
  FiUsers,
  FiShoppingBag,
  FiGrid,
  FiTrendingUp,
  FiPackage,
  FiTag,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiStar,
  FiActivity,
} from 'react-icons/fi';
import { getDashboardStats, type DashboardStats } from '../services/adminApi';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

function StatCard({ title, value, icon, change, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
  };

  const bgClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`rounded-xl border p-6 ${bgClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.isPositive ? '+' : ''}
                {change.value}%
              </span>
              <span className="text-xs text-slate-500">{change.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard stats...');
        const data = await getDashboardStats();
        console.log('Dashboard stats received:', data);
        setStats(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard statistics';
        setError(errorMessage);
        console.error('Dashboard stats error:', err);
        // Set mock data for development if API fails
        if (import.meta.env.DEV) {
          console.warn('Using mock data due to API error');
          setStats({
            users: {
              total: 0,
              totalAdmins: 0,
              totalRegularUsers: 0,
              deletedUsers: 0,
              newUsersThisMonth: 0,
              newUsersThisWeek: 0,
              usersWithPhone: 0,
              usersWithoutPhone: 0,
            },
            products: {
              total: 0,
              active: 0,
              inactive: 0,
              featured: 0,
              lowStock: 0,
            },
            categories: {
              total: 0,
              active: 0,
              mainCategories: 0,
              subCategories: 0,
            },
            recentActivity: {
              usersCreatedLast7Days: 0,
              usersCreatedLast30Days: 0,
            },
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error but still render dashboard with empty/mock data
  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-red-600 text-xl" />
            <div>
              <h3 className="text-red-900 font-semibold">Error loading dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">Please check your API connection and try again.</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-600">Unable to load dashboard data. Please check the console for details.</p>
        </div>
      </div>
    );
  }

  // If no stats, show empty state
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
    <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        {error && (
          <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-yellow-600" />
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={<FiUsers className="text-2xl" />}
          color="blue"
          change={{
            value: stats.users.newUsersThisWeek > 0 
              ? Math.round((stats.users.newUsersThisWeek / stats.users.total) * 100) 
              : 0,
            label: 'this week',
            isPositive: true,
          }}
        />
        <StatCard
          title="Total Products"
          value={stats.products.total}
          icon={<FiShoppingBag className="text-2xl" />}
          color="green"
        />
        <StatCard
          title="Active Products"
          value={stats.products.active}
          icon={<FiPackage className="text-2xl" />}
          color="purple"
        />
        <StatCard
          title="Categories"
          value={stats.categories.total}
          icon={<FiGrid className="text-2xl" />}
          color="orange"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Low Stock Products"
          value={stats.products.lowStock}
          icon={<FiAlertCircle className="text-2xl" />}
          color="red"
        />
        <StatCard
          title="Featured Products"
          value={stats.products.featured}
          icon={<FiStar className="text-2xl" />}
          color="indigo"
        />
        <StatCard
          title="New Users This Month"
          value={stats.users.newUsersThisMonth}
          icon={<FiTrendingUp className="text-2xl" />}
          color="green"
        />
      </div>

      {/* Detailed Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FiUsers className="text-indigo-600" />
            Users Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Regular Users</span>
              <span className="font-semibold text-slate-900">{stats.users.totalRegularUsers}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Administrators</span>
              <span className="font-semibold text-slate-900">{stats.users.totalAdmins}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <FiUserCheck className="text-green-600" />
                With Phone
              </span>
              <span className="font-semibold text-slate-900">{stats.users.usersWithPhone}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600 flex items-center gap-2">
                <FiUserX className="text-slate-400" />
                Without Phone
              </span>
              <span className="font-semibold text-slate-900">{stats.users.usersWithoutPhone}</span>
            </div>
          </div>
        </div>

        {/* Products & Categories Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-600" />
            Products & Categories
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Active Products</span>
              <span className="font-semibold text-slate-900">{stats.products.active}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Inactive Products</span>
              <span className="font-semibold text-slate-900">{stats.products.inactive}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <FiTag className="text-indigo-600" />
                Main Categories
              </span>
              <span className="font-semibold text-slate-900">{stats.categories.mainCategories}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600 flex items-center gap-2">
                <FiTag className="text-purple-600" />
                Sub Categories
              </span>
              <span className="font-semibold text-slate-900">{stats.categories.subCategories}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FiActivity className="text-indigo-600" />
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">New Users (Last 7 Days)</p>
            <p className="text-2xl font-bold text-slate-900">{stats.recentActivity.usersCreatedLast7Days}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">New Users (Last 30 Days)</p>
            <p className="text-2xl font-bold text-slate-900">{stats.recentActivity.usersCreatedLast30Days}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
