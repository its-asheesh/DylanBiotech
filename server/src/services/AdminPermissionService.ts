// src/services/AdminPermissionService.ts
import User, { IUser } from '../models/UserModel';
import { AdminLevel, Permission, DEFAULT_PERMISSIONS } from '../types/permissions';

export interface UpdateAdminPermissionsInput {
  adminLevel?: AdminLevel;
  permissions?: Permission[];
}

export class AdminPermissionService {
  /**
   * Get all admin users (excluding regular users)
   */
  async listAdmins(
    filters: {
      adminLevel?: AdminLevel;
      search?: string;
      includeDeleted?: boolean;
    } = {},
    page = 1,
    limit = 10
  ): Promise<{
    admins: Array<Omit<IUser, 'password'>>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {
      role: 'admin',
    };

    // Handle deleted users filter - simplified
    if (!filters.includeDeleted) {
      query.isDeleted = { $ne: true };
    }

    // Filter by admin level
    if (filters.adminLevel !== undefined) {
      query.adminLevel = filters.adminLevel;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.trim();
      const searchConditions: any[] = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];

      // If search term looks like a MongoDB ObjectId, include it in search
      if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
        searchConditions.push({ _id: searchTerm });
      }

      // Combine search with existing query conditions
      if (query.isDeleted) {
        // If we have isDeleted condition, use $and
        query.$and = [
          { isDeleted: query.isDeleted },
          { $or: searchConditions },
        ];
        delete query.isDeleted;
      } else {
        query.$or = searchConditions;
      }
    }

    const admins = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return {
      admins: admins as Array<Omit<IUser, 'password'>>,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get admin by ID (for super admin)
   */
  async getAdminById(adminId: string): Promise<Omit<IUser, 'password'> | null> {
    const admin = await User.findOne({ _id: adminId, role: 'admin' })
      .select('-password')
      .lean();
    return admin as Omit<IUser, 'password'> | null;
  }

  /**
   * Update admin permissions and level (super admin only)
   * @param targetAdminId - The admin whose permissions to update
   * @param currentSuperAdminId - The super admin making the change
   * @param updates - Permission updates
   */
  async updateAdminPermissions(
    targetAdminId: string,
    currentSuperAdminId: string,
    updates: UpdateAdminPermissionsInput
  ): Promise<IUser> {
    // Prevent self-modification of permissions
    if (targetAdminId === currentSuperAdminId) {
      throw new Error('Cannot modify your own permissions');
    }

    // Find the target admin
    const targetAdmin = await User.findById(targetAdminId);
    if (!targetAdmin) {
      throw new Error('Admin not found');
    }

    if (targetAdmin.role !== 'admin') {
      throw new Error('Target user is not an admin');
    }

    // If demoting a super admin, check if this is the last super admin
    if (targetAdmin.adminLevel === AdminLevel.SUPER_ADMIN && 
        updates.adminLevel !== undefined && 
        updates.adminLevel !== AdminLevel.SUPER_ADMIN) {
      const superAdminCount = await this.countSuperAdmins();
      if (superAdminCount <= 1) {
        throw new Error('Cannot demote the last super admin in the system');
      }
    }

    // Update admin level if provided
    if (updates.adminLevel !== undefined) {
      targetAdmin.adminLevel = updates.adminLevel;
      
      // If setting to a level with default permissions, apply them
      // But only if permissions array is not explicitly provided
      if (updates.permissions === undefined && DEFAULT_PERMISSIONS[updates.adminLevel]) {
        targetAdmin.permissions = DEFAULT_PERMISSIONS[updates.adminLevel];
      }
    }

    // Update permissions if provided
    if (updates.permissions !== undefined) {
      // Super admin cannot have restricted permissions
      if (targetAdmin.adminLevel === AdminLevel.SUPER_ADMIN) {
        throw new Error('Cannot restrict permissions for super admin');
      }
      targetAdmin.permissions = updates.permissions;
    }

    return await targetAdmin.save();
  }

  /**
   * Grant a permission to an admin (super admin only)
   */
  async grantPermission(
    targetAdminId: string,
    currentSuperAdminId: string,
    permission: Permission
  ): Promise<IUser> {
    const targetAdmin = await User.findById(targetAdminId);
    if (!targetAdmin || targetAdmin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    if (targetAdminId === currentSuperAdminId) {
      throw new Error('Cannot modify your own permissions');
    }

    if (targetAdmin.adminLevel === AdminLevel.SUPER_ADMIN) {
      throw new Error('Super admin already has all permissions');
    }

    if (!targetAdmin.permissions) {
      targetAdmin.permissions = [];
    }

    if (!targetAdmin.permissions.includes(permission)) {
      targetAdmin.permissions.push(permission);
      await targetAdmin.save();
    }

    return targetAdmin;
  }

  /**
   * Revoke a permission from an admin (super admin only)
   */
  async revokePermission(
    targetAdminId: string,
    currentSuperAdminId: string,
    permission: Permission
  ): Promise<IUser> {
    const targetAdmin = await User.findById(targetAdminId);
    if (!targetAdmin || targetAdmin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    if (targetAdminId === currentSuperAdminId) {
      throw new Error('Cannot modify your own permissions');
    }

    if (targetAdmin.adminLevel === AdminLevel.SUPER_ADMIN) {
      throw new Error('Cannot revoke permissions from super admin');
    }

    if (targetAdmin.permissions) {
      targetAdmin.permissions = targetAdmin.permissions.filter(p => p !== permission);
      await targetAdmin.save();
    }

    return targetAdmin;
  }

  /**
   * Count super admins in the system
   */
  async countSuperAdmins(): Promise<number> {
    return await User.countDocuments({ 
      role: 'admin', 
      adminLevel: AdminLevel.SUPER_ADMIN,
      isDeleted: { $ne: true }
    });
  }

  /**
   * Initialize default permissions for an admin based on their level
   */
  async initializeAdminPermissions(admin: IUser): Promise<IUser> {
    if (admin.role !== 'admin' || !admin.adminLevel) {
      return admin;
    }

    // If admin has no permissions set, initialize with defaults
    if (!admin.permissions || admin.permissions.length === 0) {
      admin.permissions = DEFAULT_PERMISSIONS[admin.adminLevel] || [];
      await admin.save();
    }

    return admin;
  }
}

