import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../auth/LogoutButton';

const Navigation: React.FC = () => { 
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Company Name  {/*DylanBiotech*/}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            
            {user?.role == 'admin' && (
              <Link to="/categories" className="text-gray-600 hover:text-gray-900">
              Categories
            </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Welcome, {user.name}
                </span>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Admin Panel
                  </Link>
                )}
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 