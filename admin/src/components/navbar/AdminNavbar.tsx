// src/components/navbar/AdminNavbar.tsx
import { Link } from 'react-router-dom';
import { navbarConfig } from '../../config/navigation';

export interface Breadcrumb {
  name: string;
  href?: string;
}

export interface AdminNavbarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenSidebar: () => void;
  breadcrumbs: Breadcrumb[];
  pageTitle: string;
}

export default function AdminNavbar({
  sidebarOpen,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenSidebar,
  breadcrumbs,
  pageTitle,
}: AdminNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6 w-full">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Logo Toggle Button (Desktop) */}
        <button
          className={`hidden lg:flex items-center justify-center w-11 h-11 rounded-lg ${navbarConfig.logo.backgroundColor} text-white font-semibold text-base shadow-sm hover:bg-indigo-700 transition-all duration-200`}
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? navbarConfig.logo.title.collapsed : navbarConfig.logo.title.expanded}
        >
          {navbarConfig.logo.text}
        </button>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-colors"
          onClick={onOpenSidebar}
        >
          {navbarConfig.mobileMenu.icon}
        </button>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-400">/</span>}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-slate-900 transition-colors truncate font-medium"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold truncate">{crumb.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Page Title (Mobile) */}
        <h1 className="md:hidden text-lg font-semibold text-slate-900 truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
          {navbarConfig.search.icon}
          <span className="text-slate-400">{navbarConfig.search.placeholder}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
          {navbarConfig.notifications.icon}
          {navbarConfig.notifications.showBadge && (
            <span className={`absolute top-2 right-2 w-2 h-2 ${navbarConfig.notifications.badgeColor} rounded-full ring-2 ring-white`}></span>
          )}
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className={`h-9 w-9 rounded-full ${navbarConfig.user.avatar.backgroundColor} text-white flex items-center justify-center text-sm font-semibold shadow-sm ring-1 ring-slate-200`}>
            {navbarConfig.user.avatar.initial}
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-semibold text-slate-900">{navbarConfig.user.name}</div>
            <div className="text-xs text-slate-500">{navbarConfig.user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

