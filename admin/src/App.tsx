// Example: App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
// import Dashboard from './pages/admin/Dashboard';
// import Users from './pages/admin/Users';
// import Login from './pages/auth/Login';
// import ProtectedRoute from './components/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin/*"
          element={
            
              <AdminLayout>
                <Routes>
                  {/* <Route index element={<Dashboard />} />
                  <Route path="users" element={<Users />} /> */}
                  <Route path="settings" element={<div>Settings</div>} />
                </Routes>
              </AdminLayout>
      
          }
        />
      </Routes>
    </BrowserRouter>
  );
}