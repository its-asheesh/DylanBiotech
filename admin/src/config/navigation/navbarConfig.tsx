// src/config/navigation/navbarConfig.tsx
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

export interface NavbarConfig {
  logo: {
    text: string;
    backgroundColor: string;
    title: {
      expanded: string;
      collapsed: string;
    };
  };
  search: {
    placeholder: string;
    icon: React.ReactNode;
  };
  notifications: {
    icon: React.ReactNode;
    showBadge: boolean;
    badgeColor: string;
  };
  user: {
    name: string;
    role: string;
    avatar: {
      initial: string;
      backgroundColor: string;
    };
  };
  mobileMenu: {
    icon: React.ReactNode;
  };
}

export const navbarConfig: NavbarConfig = {
  logo: {
    text: 'DB',
    backgroundColor: 'bg-indigo-600',
    title: {
      expanded: 'Collapse sidebar',
      collapsed: 'Expand sidebar',
    },
  },
  search: {
    placeholder: 'Search...',
    icon: <FiSearch className="h-4 w-4" />,
  },
  notifications: {
    icon: <FiBell className="h-5 w-5" />,
    showBadge: true,
    badgeColor: 'bg-rose-500',
  },
  user: {
    name: 'Admin',
    role: 'Administrator',
    avatar: {
      initial: 'A',
      backgroundColor: 'bg-indigo-600',
    },
  },
  mobileMenu: {
    icon: <FiMenu className="h-5 w-5" />,
  },
};

