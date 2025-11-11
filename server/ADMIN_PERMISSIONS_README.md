# Tiered Admin Permission System

## Overview

This system implements a tiered admin hierarchy with granular permission control. Super admins can manage other admins' permissions and restrict/allow access to specific features.

## Admin Levels

1. **Super Admin** (`AdminLevel.SUPER_ADMIN = 3`)
   - Highest level with all permissions
   - Can manage other admins
   - Cannot have permissions restricted
   - Cannot modify own permissions

2. **Admin** (`AdminLevel.ADMIN = 2`)
   - Standard admin level
   - Has default permissions for admin tasks
   - Can be granted/revoked specific permissions by super admin

3. **Moderator** (`AdminLevel.MODERATOR = 1`)
   - Limited admin level
   - Has basic viewing and update permissions
   - Cannot delete or create most resources

## Permissions

### User Management
- `VIEW_USERS` - View user list and details
- `MANAGE_USERS` - Update user profiles, restore deleted users
- `DELETE_USERS` - Delete users (soft/hard delete)
- `MANAGE_USER_ROLES` - Promote/demote users to/from admin

### Product Management
- `VIEW_PRODUCTS` - View products (public by default)
- `CREATE_PRODUCTS` - Create new products
- `UPDATE_PRODUCTS` - Update existing products
- `DELETE_PRODUCTS` - Delete products

### Category Management
- `VIEW_CATEGORIES` - View categories (public by default)
- `MANAGE_CATEGORIES` - Create, update, delete categories

### Tag Category Management
- `VIEW_TAG_CATEGORIES` - View tag categories (public by default)
- `MANAGE_TAG_CATEGORIES` - Create, update, delete tag categories

### Admin Management (Super Admin Only)
- `VIEW_ADMINS` - View admin list
- `MANAGE_ADMINS` - Update admin details
- `MANAGE_ADMIN_PERMISSIONS` - Grant/revoke permissions, change admin levels

### Analytics & Dashboard
- `VIEW_ANALYTICS` - View analytics data
- `VIEW_DASHBOARD` - Access admin dashboard

### Settings
- `MANAGE_SETTINGS` - Manage system settings

## Default Permissions by Level

### Moderator
- View users
- View products
- Update products
- View categories
- View tag categories
- View dashboard

### Admin
- All moderator permissions, plus:
- Manage users
- Delete users
- Create products
- Delete products
- Manage categories
- Manage tag categories
- View analytics

### Super Admin
- All permissions (cannot be restricted)

## API Endpoints

### Admin Management (Super Admin Only)

#### List Admins
```
GET /api/admin/admins
Query params: page, limit, adminLevel, search, includeDeleted
```

#### Get Admin by ID
```
GET /api/admin/admins/:id
```

#### Update Admin Permissions
```
PUT /api/admin/admins/:id/permissions
Body: {
  adminLevel?: AdminLevel,
  permissions?: Permission[]
}
```

#### Grant Permission
```
POST /api/admin/admins/:id/permissions/grant
Body: {
  permission: Permission
}
```

#### Revoke Permission
```
POST /api/admin/admins/:id/permissions/revoke
Body: {
  permission: Permission
}
```

## Security Features

1. **Self-Protection**
   - Admins cannot modify their own permissions
   - Admins cannot change their own role
   - Admins cannot delete their own account

2. **System Protection**
   - Cannot demote/delete the last super admin
   - Super admins cannot have permissions restricted
   - Super admins automatically have all permissions

3. **Permission Checks**
   - All admin routes use `requirePermission()` middleware
   - Super admin routes use `requireSuperAdmin()` middleware
   - Permissions are checked on every request

## Usage Examples

### Creating a Super Admin
Use the `createAdmin` utility script:
```bash
npm run create-admin
```

This creates a super admin by default.

### Promoting a User to Admin
```typescript
// Via API
PUT /api/users/:id/role
Body: {
  role: 'admin',
  adminLevel: AdminLevel.ADMIN  // Optional, defaults to ADMIN
}
```

### Granting Specific Permission
```typescript
// Super admin only
POST /api/admin/admins/:id/permissions/grant
Body: {
  permission: Permission.CREATE_PRODUCTS
}
```

### Revoking Permission
```typescript
// Super admin only
POST /api/admin/admins/:id/permissions/revoke
Body: {
  permission: Permission.DELETE_PRODUCTS
}
```

## Migration Notes

Existing admins in the database will need to be updated:
- Set `adminLevel` to `AdminLevel.SUPER_ADMIN` for existing admins
- Or set appropriate level and permissions based on your needs

## Database Schema Changes

The User model now includes:
- `adminLevel?: AdminLevel` - Admin hierarchy level
- `permissions?: Permission[]` - Custom permissions array

These fields are only relevant when `role === 'admin'`.

