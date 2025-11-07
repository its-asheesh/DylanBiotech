// src/components/sidebar/AdminSidebar.tsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
  onToggleCollapse?: (collapsed: boolean) => void;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  navItems,
  user,
  onLogout,
  collapsed: externalCollapsed,
}: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [internalCollapsed] = useState(false);
  const [mindMapOpen, setMindMapOpen] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();


  // Use external collapsed state if provided, otherwise use internal
  const sidebarCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;


  // Auto-expand active menu items
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const active = item.href === '/admin' 
          ? location.pathname === '/admin'
          : location.pathname.startsWith(item.href);
        if (active && !expandedItems.includes(item.href)) {
          setExpandedItems((prev) => [...prev, item.href]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close mind map when clicking outside
  useEffect(() => {
    if (!mindMapOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const mindMap = target.closest('[data-mindmap]');
      const mindMapButton = target.closest('button[data-mindmap-button]');
      
      // Don't close if clicking inside mind-map or on the button that opened it
      if (mindMap || mindMapButton) {
        return;
      }
      
      // Close if clicking outside
      setMindMapOpen(null);
    };
    
    // Use a small delay to avoid closing immediately when opening
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);
    
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [mindMapOpen]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      if (onLogout) {
        onLogout();
      } else {
        localStorage.removeItem('accessToken');
        navigate('/admin/login');
      }
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-30 flex h-[calc(100vh-4rem)] flex-col bg-slate-900 text-white shadow-xl transition-all duration-300 ease-in-out lg:fixed lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20' : 'w-72'} ${mindMapOpen ? 'overflow-visible' : ''}`}
        style={{ overflowX: mindMapOpen ? 'visible' : 'hidden' }}
      >
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-visible p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.href);
              const active = isActive(item.href);

              return (
                <li key={item.href} className="relative" style={{ zIndex: mindMapOpen === item.href ? 50 : 'auto' }}>
                  {hasChildren ? (
                    <>
                      {sidebarCollapsed ? (
                        // Collapsed: Show mind-map style on click
                        <CollapsedNavItemWithMindMap
                          item={item}
                          active={active}
                          mindMapOpen={mindMapOpen === item.href}
                          onToggle={() => setMindMapOpen(mindMapOpen === item.href ? null : item.href)}
                          onChildClick={(childHref) => {
                            onClose(); // Close mobile sidebar if open
                            setMindMapOpen(null); // Close mind-map
                            // Don't expand sidebar - keep it collapsed
                            navigate(childHref);
                          }}
                          children={item.children!}
                          location={location}
                        />
                      ) : (
                        // Expanded: Normal behavior
                        <>
                          <button
                            onClick={() => toggleExpanded(item.href)}
                            className={`w-full flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                              active
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-lg shrink-0">{item.icon}</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            {isExpanded ? (
                              <FiChevronDown className="text-sm shrink-0" />
                            ) : (
                              <FiChevronRight className="text-sm shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <ul className="mt-1.5 ml-4 space-y-1 border-l-2 border-slate-700/50 pl-4 animate-in slide-in-from-left-2">
                              {item.children!.map((child) => {
                                const childActive = location.pathname === child.href;
                                return (
                                  <li key={child.href}>
                                    <Link
                                      to={child.href}
                                      onClick={onClose}
                                      className={`flex items-center gap-3 rounded-md px-4 py-2 text-sm transition-all duration-200 ${
                                        childActive
                                          ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500 pl-3.5 font-medium'
                                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                      }`}
                                    >
                                      <span className="text-base shrink-0">{child.icon}</span>
                                      <span className="truncate">{child.name}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <span className="text-lg shrink-0">{item.icon}</span>
                      {!sidebarCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full shrink-0 font-medium">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {/* Active indicator for collapsed state */}
                      {sidebarCollapsed && active && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-400 rounded-full border-2 border-slate-900"></span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-800 p-4 bg-slate-800/40">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white shadow-sm ring-1 ring-slate-700">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email || 'admin@dylanbiotech.com'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 border border-slate-700"
              >
                <FiLogOut className="text-base" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white shadow-sm ring-1 ring-slate-700">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200"
                title="Logout"
              >
                <FiLogOut className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// Component for collapsed nav items with mind-map
function CollapsedNavItemWithMindMap({
  item,
  active,
  mindMapOpen,
  onToggle,
  onChildClick,
  children,
  location,
}: {
  item: NavItem;
  active: boolean;
  mindMapOpen: boolean;
  onToggle: () => void;
  onChildClick: (href: string) => void;
  children: NavItem[];
  location: ReturnType<typeof useLocation>;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (mindMapOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setPosition({
            top: rect.top,
            left: rect.right + 8, // 8px margin
          });
        }
      };
      
      updatePosition();
      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [mindMapOpen]);

  const mindMapContent = mindMapOpen ? (
    <div
      className="fixed z-[100] animate-[fadeIn_0.2s_ease-in-out] pointer-events-auto"
      data-mindmap
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: 1,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        {/* Connection line from parent to mind-map */}
        <div className="absolute -left-2 top-6 w-2 h-px bg-gradient-to-r from-indigo-500/60 to-transparent"></div>
        
        <div 
          className="bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 p-4 min-w-[240px] ring-1 ring-slate-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Parent node header */}
          <Link
            to={item.href}
            onClick={(e) => {
              e.stopPropagation();
              onChildClick(item.href);
            }}
            className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50 hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg ring-2 ring-indigo-500/20">
              {item.icon}
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-white block">{item.name}</span>
              <span className="text-xs text-slate-400">{children.length} items • Click to navigate</span>
            </div>
          </Link>
          
          {/* Child nodes in mind-map style with connection lines */}
          <div className="space-y-1.5 relative">
            {children.map((child, index) => {
              const childActive = location.pathname === child.href;
              const isLast = index === children.length - 1;
              
              return (
                <div key={child.href} className="relative group/item">
                  {/* Vertical connection line */}
                  {!isLast && (
                    <div className="absolute left-3.5 top-8 w-px h-full bg-gradient-to-b from-indigo-400/40 to-transparent"></div>
                  )}
                  
                  {/* Horizontal connection line */}
                  <div className="absolute left-0 top-3.5 w-3.5 h-px bg-gradient-to-r from-indigo-400/40 to-transparent"></div>
                  
                  {/* Connection node */}
                  <div className="absolute left-3.5 top-3.5 w-1.5 h-1.5 rounded-full bg-indigo-400/60 group-hover/item:bg-indigo-400 group-hover/item:scale-150 transition-transform"></div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Child clicked:', child.href);
                      onChildClick(child.href);
                    }}
                    className={`relative flex items-center gap-3 pl-6 pr-3 py-2.5 text-sm transition-all duration-200 rounded-lg group/link w-full text-left ${
                      childActive
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white hover:border-slate-600/50 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      childActive
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30'
                        : 'bg-slate-700/50 text-slate-300 group-hover/link:bg-indigo-600/20 group-hover/link:text-indigo-300 group-hover/link:scale-110'
                    }`}>
                      {child.icon}
                    </div>
                    <span className="flex-1 font-medium">{child.name}</span>
                    {childActive && (
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse ring-2 ring-indigo-400/50"></span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const handleParentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If mind-map is open, close it. Otherwise, open it.
    if (mindMapOpen) {
      onToggle(); // Close mind-map
    } else {
      onToggle(); // Open mind-map
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-mindmap-button
        onClick={handleParentClick}
        onDoubleClick={(e) => {
          // Double-click navigates to parent
          e.preventDefault();
          e.stopPropagation();
          onChildClick(item.href);
        }}
        className={`flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200 w-full relative ${
          active || mindMapOpen
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        title={mindMapOpen ? `${item.name} - Double click to navigate` : `${item.name} - Click to view options`}
      >
        <span className="text-lg shrink-0">{item.icon}</span>
        {/* Active indicator dot */}
        {active && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-400 rounded-full border-2 border-slate-900"></span>
        )}
      </button>
      {typeof document !== 'undefined' && createPortal(mindMapContent, document.body)}
    </>
  );
}

