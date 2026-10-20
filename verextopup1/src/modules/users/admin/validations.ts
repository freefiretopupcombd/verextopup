import { z } from "zod";

// ==================================================
// ADMIN USER MANAGEMENT VALIDATIONS
// ==================================================

export const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;
export const USER_STATUSES = ["ACTIVE", "INACTIVE", "BANNED", "SUSPENDED"] as const;

export type UserRole = (typeof ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

// ---- Change Role ----
export const changeRoleSchema = z.object({
  userId: z.string().min(1).max(100),
  role: z.enum(ROLES),
  reason: z.string().min(10).max(500),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

// ---- Change Status (Ban/Unban) ----
export const changeStatusSchema = z.object({
  userId: z.string().min(1).max(100),
  status: z.enum(USER_STATUSES),
  reason: z.string().min(10).max(500),
});

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;

// ---- Send Notification ----
export const sendNotificationSchema = z.object({
  userId: z.string().min(1).max(100),
  title: z.string().min(3).max(200),
  message: z.string().min(5).max(2000),
  link: z.string().max(500).optional().or(z.literal("")),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

// ---- Bulk Change Status ----
export const bulkStatusSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(100),
  status: z.enum(USER_STATUSES),
  reason: z.string().min(10).max(500),
});

export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;