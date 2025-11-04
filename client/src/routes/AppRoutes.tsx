import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Categories from '../pages/Categories';
import CategoryDetail from '../pages/CategoryDetail';
import CreateCategory from '../pages/CreateCategory';
import EditCategory from '../pages/EditCategory';
import Admin from '../pages/Admin';
import Navigation from '../components/layout/Navigation';
import MobileAuth from '@/pages/MobileAuth';
import ProfilePage from '@/pages/ProfilePage';

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup-mobile" element={<MobileAuth/>}/>
        
        {/* Category Routes */}
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryDetail />} />
        <Route 
          path="/categories/create" 
          element={
            <ProtectedRoute requireAdmin>
              <CreateCategory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories/edit/:id" 
          element={
            <ProtectedRoute requireAdmin>
              <EditCategory />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        {/* Add more routes here as needed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AppRoutes; 