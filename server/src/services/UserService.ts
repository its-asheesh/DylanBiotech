// src/services/UserService.ts
import User, { IUser } from "../models/UserModel";

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role?: "user" | "admin";
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  avatar?: string;
}

export class UserService {
  async create(input: CreateUserInput): Promise<IUser> {
    const user = new User(input);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return await User.findOne({ phone });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  /**
   * Get user by ID for admin (excludes password)
   * @param id - User ID
   */
  async getUserByIdForAdmin(id: string): Promise<Omit<IUser, 'password'> | null> {
    const user = await User.findById(id).select('-password').lean();
    return user as Omit<IUser, 'password'> | null;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");
    user.password = newPassword; // UserModel should hash on save
    await user.save();
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<IUser> {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");
    Object.assign(user, data);
    return await user.save();
  }

  async deleteUser(userId: string): Promise<void> {
  const result = await User.findByIdAndDelete(userId);
  if (!result) {
    throw new Error("User not found");
  }
  // Optionally: delete related data (orders, favorites, etc.)
}

async verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const user = await this.findById(userId);
  if (!user || !user.password) return false;
  return await user.matchPassword(password);
}

  /**
   * Count the number of admin users in the system (excluding deleted)
   */
  async countAdmins(): Promise<number> {
    return await User.countDocuments({ role: 'admin', isDeleted: { $ne: true } });
  }

  /**
   * Delete user (admin only) - soft delete by default
   * @param userId - The ID of the user to delete
   * @param currentAdminId - The ID of the admin making the change (to prevent self-deletion)
   * @param hardDelete - If true, permanently delete. If false, soft delete (default: false)
   */
  async deleteUserForAdmin(
    userId: string,
    currentAdminId: string,
    hardDelete: boolean = false
  ): Promise<void> {
    // Find the target user
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already deleted (for soft delete)
    if (!hardDelete && user.isDeleted) {
      throw new Error('User is already deleted');
    }

    // Prevent admin from deleting themselves
    if (userId === currentAdminId) {
      throw new Error('Cannot delete your own account');
    }

    // If deleting an admin, check if this is the last admin
    if (user.role === 'admin') {
      const adminCount = await this.countAdmins();
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin in the system');
      }
    }

    if (hardDelete) {
      // Permanent deletion
      await User.findByIdAndDelete(userId);
      // TODO: Optionally cascade delete related data (favorites, refresh tokens, etc.)
    } else {
      // Soft delete - mark as deleted
      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();
    }
  }

  /**
   * Restore a soft-deleted user (admin only)
   * @param userId - The ID of the user to restore
   */
  async restoreUser(userId: string): Promise<IUser> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isDeleted) {
      throw new Error('User is not deleted');
    }

    user.isDeleted = false;
    user.deletedAt = undefined;
    return await user.save();
  }

  /**
   * List all users with pagination, filtering, and sorting (admin only)
   * @param filters - Filter options (role, search, date range, etc.)
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param sortBy - Field to sort by (default: 'createdAt')
   * @param sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
   */
  async listUsers(
    filters: {
      role?: 'user' | 'admin';
      search?: string;
      includeDeleted?: boolean;
      onlyDeleted?: boolean;
      createdFrom?: string; // ISO date string
      createdTo?: string; // ISO date string
      hasPhone?: boolean;
    } = {},
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{
    users: Array<Omit<IUser, 'password'>>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Handle deleted users filter
    if (filters.onlyDeleted) {
      // Show only deleted users
      query.isDeleted = true;
    } else if (filters.includeDeleted) {
      // Show all users (including deleted)
      // No filter on isDeleted
    } else {
      // Exclude deleted users by default
      query.isDeleted = { $ne: true };
    }

    // Filter by role
    if (filters.role) {
      query.role = filters.role;
    }

    // Filter by phone existence
    if (filters.hasPhone !== undefined) {
      if (filters.hasPhone) {
        // Users with phone number
        query.$and = query.$and || [];
        query.$and.push({
          phone: { $exists: true, $ne: null },
        });
        query.$and.push({
          phone: { $ne: '' },
        });
      } else {
        // Users without phone number
        const phoneCondition = {
          $or: [
            { phone: { $exists: false } },
            { phone: null },
            { phone: '' },
          ],
        };
        if (query.$and) {
          query.$and.push(phoneCondition);
        } else {
          query.$and = [phoneCondition];
        }
      }
    }

    // Date range filter (createdAt)
    if (filters.createdFrom || filters.createdTo) {
      query.createdAt = {};
      if (filters.createdFrom) {
        const fromDate = new Date(filters.createdFrom);
        if (!isNaN(fromDate.getTime())) {
          query.createdAt.$gte = fromDate;
        }
      }
      if (filters.createdTo) {
        const toDate = new Date(filters.createdTo);
        if (!isNaN(toDate.getTime())) {
          // Set to end of day
          toDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = toDate;
        }
      }
      // If date range is invalid, remove the filter
      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }

    // Enhanced search - searches across multiple fields including user ID
    if (filters.search) {
      const searchTerm = filters.search.trim();
      const searchConditions: any[] = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];

      // If search term looks like a MongoDB ObjectId, include it in search
      if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
        searchConditions.push({ _id: searchTerm });
      }

      // Combine search conditions with $or
      if (searchConditions.length > 0) {
        const searchCondition = { $or: searchConditions };
        if (query.$and) {
          query.$and.push(searchCondition);
        } else {
          query.$and = [searchCondition];
        }
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return {
      users: users as Array<Omit<IUser, 'password'>>,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a user's role (admin only)
   * @param userId - The ID of the user whose role to update
   * @param newRole - The new role ('user' | 'admin')
   * @param currentAdminId - The ID of the admin making the change (to prevent self-demotion)
   */
  async updateUserRole(
    userId: string,
    newRole: 'user' | 'admin',
    currentAdminId: string
  ): Promise<IUser> {
    // Validate role value
    if (newRole !== 'user' && newRole !== 'admin') {
      throw new Error('Invalid role. Must be "user" or "admin"');
    }

    // Find the target user
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent admin from changing their own role
    if (userId === currentAdminId) {
      throw new Error('Cannot change your own role');
    }

    // If demoting from admin, check if this is the last admin
    if (user.role === 'admin' && newRole === 'user') {
      const adminCount = await this.countAdmins();
      if (adminCount <= 1) {
        throw new Error('Cannot demote the last admin in the system');
      }
    }

    // Update the role
    user.role = newRole;
    return await user.save();
  }
}


