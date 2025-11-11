// src/types/permissions.ts

/**
 * Admin role levels in hierarchy (higher number = more privileges)
 */
export enum AdminLevel {
  MODERATOR = 1,
  ADMIN = 2,
  SUPER_ADMIN = 3,
}

/**
 * Permission types that can be granted to admins
 */
export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  // Product Management
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCTS = 'create_products',
  UPDATE_PRODUCTS = 'update_products',
  DELETE_PRODUCTS = 'delete_products',
  
  // Category Management
  VIEW_CATEGORIES = 'view_categories',
  MANAGE_CATEGORIES = 'manage_categories',
  
  // Tag Category Management
  VIEW_TAG_CATEGORIES = 'view_tag_categories',
  MANAGE_TAG_CATEGORIES = 'manage_tag_categories',
  
  // Admin Management (only super admin)
  VIEW_ADMINS = 'view_admins',
  MANAGE_ADMINS = 'manage_admins',
  MANAGE_ADMIN_PERMISSIONS = 'manage_admin_permissions',
  
  // Analytics & Dashboard
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Settings
  MANAGE_SETTINGS = 'manage_settings',
}

/**
 * Default permissions for each admin level
 */
export const DEFAULT_PERMISSIONS: Record<AdminLevel, Permission[]> = {
  [AdminLevel.MODERATOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCTS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_TAG_CATEGORIES,
    Permission.VIEW_DASHBOARD,
  ],
  [AdminLevel.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.DELETE_USERS,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.UPDATE_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.VIEW_CATEGORIES,
    Permission.MANAGE_CATEGORIES,
    Permission.VIEW_TAG_CATEGORIES,
    Permission.MANAGE_TAG_CATEGORIES,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DASHBOARD,
  ],
  [AdminLevel.SUPER_ADMIN]: [
    // Super admin has all permissions by default
    ...Object.values(Permission),
  ],
};

/**
 * Helper function to check if a permission is included in a list
 */
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Helper function to check if user has any of the required permissions
 */
export function hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Helper function to check if user has all required permissions
 */
export function hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

