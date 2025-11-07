// src/layouts/AdminLayout.tsx
import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import AdminNavbar, { type Breadcrumb } from '../components/navbar/AdminNavbar';
import { sidebarConfig } from '../config/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  // Get breadcrumbs
  const getBreadcrumbs = (): Breadcrumb[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [{ name: 'Dashboard', href: '/admin' }];

    if (pathSegments.length > 1) {
      const section = pathSegments[1];
      const sectionName = sidebarConfig.find((item) => item.href.includes(section))?.name || section;
      breadcrumbs.push({ name: sectionName, href: `/admin/${section}` });

      if (pathSegments.length > 2) {
        const subSection = pathSegments[2];
        breadcrumbs.push({ name: subSection.charAt(0).toUpperCase() + subSection.slice(1) });
      }
    }

    return breadcrumbs;
  };

      // Get page title
      const getPageTitle = (): string => {
        return (
          sidebarConfig.find((item) => isActive(item.href))?.name ||
          sidebarConfig
            .flatMap((item) => (item.children ? item.children : [item]))
            .find((item) => location.pathname === item.href)?.name ||
          'Admin'
        );
      };

  return (
    <div className="flex min-h-screen bg-gray-50 antialiased">
      {/* Sidebar Component */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={sidebarConfig}
        user={{
          name: 'Admin User',
          email: 'admin@dylanbiotech.com',
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        onExpandSidebar={() => setSidebarCollapsed(false)}
      />

      {/* Top Navbar Component */}
      <AdminNavbar
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSidebar={() => setSidebarOpen(true)}
        breadcrumbs={getBreadcrumbs()}
        pageTitle={getPageTitle()}
      />

      {/* Main content */}
      <div className={`flex flex-1 flex-col w-full transition-all duration-300 pt-16 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}