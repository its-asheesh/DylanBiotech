// src/layouts/AdminLayout.tsx
import { useState, type ReactNode } from 'react';
import { FiHome, FiUsers, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: <FiHome /> },
  { name: 'Users', href: '/admin/users', icon: <FiUsers /> },
  { name: 'Settings', href: '/admin/settings', icon: <FiSettings /> },
  // Add more as needed
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 flex h-full flex-col bg-white shadow-lg transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold text-blue-700">DylanBiotech</div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col w-full">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {navItems.find((item) => item.href === location.pathname)?.name ||
                'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* User profile / logout */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                A
              </div>
              <span className="hidden md:inline text-sm text-gray-700">asheesh-rathore</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}