// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import LowStock from './pages/LowStock';
import Categories from './pages/Categories';
import AddCategory from './pages/AddCategory';
import TagCategories from './pages/TagCategories';
import AddTagCategory from './pages/AddTagCategory';
import Users from './pages/Users';
import AdminManagement from './pages/AdminManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    {/* Products Routes */}
                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<AddProduct />} />
                    <Route path="products/low-stock" element={<LowStock />} />
                    {/* Categories Routes */}
                    <Route path="categories" element={<Categories />} />
                    <Route path="categories/new" element={<AddCategory />} />
                    {/* Tag Categories Routes */}
                    <Route path="tag-categories" element={<TagCategories />} />
                    <Route path="tag-categories/new" element={<AddTagCategory />} />
                    {/* Other Routes */}
                    <Route path="users" element={<Users />} />
                    <Route path="admins" element={<AdminManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}