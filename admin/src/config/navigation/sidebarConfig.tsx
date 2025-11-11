// src/config/navigation/sidebarConfig.tsx
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiShoppingBag,
  FiTag,
  FiGrid,
  FiPackage,
  FiTrendingUp,
  FiBarChart2,
  FiShield,
} from 'react-icons/fi';
import { type NavItem } from '../../components/sidebar/AdminSidebar';

export const sidebarConfig: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: <FiHome /> },
  {
    name: 'Products',
    href: '/admin/products',
    icon: <FiShoppingBag />,
    children: [
      { name: 'All Products', href: '/admin/products', icon: <FiPackage /> },
      { name: 'Add Product', href: '/admin/products/new', icon: <FiPackage /> },
      { name: 'Low Stock', href: '/admin/products/low-stock', icon: <FiTrendingUp /> },
    ],
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: <FiGrid />,
    children: [
      { name: 'All Categories', href: '/admin/categories', icon: <FiGrid /> },
      { name: 'Add Category', href: '/admin/categories/new', icon: <FiGrid /> },
    ],
  },
  {
    name: 'Tag Categories',
    href: '/admin/tag-categories',
    icon: <FiTag />,
    children: [
      { name: 'All Tags', href: '/admin/tag-categories', icon: <FiTag /> },
      { name: 'Add Tag', href: '/admin/tag-categories/new', icon: <FiTag /> },
    ],
  },
  { name: 'Users', href: '/admin/users', icon: <FiUsers /> },
  { name: 'Admin Management', href: '/admin/admins', icon: <FiShield />, requireSuperAdmin: true },
  { name: 'Analytics', href: '/admin/analytics', icon: <FiBarChart2 /> },
  { name: 'Settings', href: '/admin/settings', icon: <FiSettings /> },
];

