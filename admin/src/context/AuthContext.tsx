// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  login as loginApi, 
  logout as logoutApi, 
  getCurrentUser, 
  isAuthenticated, 
  type User,
  type LoginCredentials 
} from '../services/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/admin/login';
      
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          // Only allow admins to access admin panel
          if (userData.role === 'admin') {
            setUser(userData);
            // If on login page and authenticated, redirect to dashboard
            if (isLoginPage) {
              navigate('/admin', { replace: true });
            }
          } else {
            logoutApi();
            if (!isLoginPage) {
              navigate('/admin/login', { replace: true });
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logoutApi();
          if (!isLoginPage) {
            navigate('/admin/login', { replace: true });
          }
        }
      } else {
        // Not authenticated - only redirect if not already on login page
        if (!isLoginPage && currentPath.startsWith('/admin')) {
          navigate('/admin/login', { replace: true });
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await loginApi(credentials);
      
      // Verify user is an admin
      if (response.role !== 'admin') {
        logoutApi();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        role: response.role,
        adminLevel: response.adminLevel,
        permissions: response.permissions,
      });
      
      navigate('/admin');
    } catch (error: any) {
      logoutApi();
      throw error;
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    navigate('/admin/login');
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

