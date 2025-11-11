// src/validations/adminPermissionValidations.ts
import { z } from 'zod';
import { AdminLevel, Permission } from '../types/permissions';

export const listAdminsSchema = {
  query: z.object({
    page: z.string().optional().transform(val => val ? Number(val) : undefined),
    limit: z.string().optional().transform(val => val ? Number(val) : undefined),
    adminLevel: z.string().optional().transform(val => val ? Number(val) : undefined),
    search: z.string().optional(),
    includeDeleted: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  }),
};

export const getAdminByIdSchema = {
  params: z.object({
    id: z.string().min(1, 'Admin ID is required'),
  }),
};

export const updateAdminPermissionsSchema = {
  params: z.object({
    id: z.string().min(1, 'Admin ID is required'),
  }),
  body: z.object({
    adminLevel: z.nativeEnum(AdminLevel).optional(),
    permissions: z.array(z.nativeEnum(Permission)).optional(),
  }),
};

export const grantPermissionSchema = {
  params: z.object({
    id: z.string().min(1, 'Admin ID is required'),
  }),
  body: z.object({
    permission: z.nativeEnum(Permission),
  }),
};

export const revokePermissionSchema = {
  params: z.object({
    id: z.string().min(1, 'Admin ID is required'),
  }),
  body: z.object({
    permission: z.nativeEnum(Permission),
  }),
};

