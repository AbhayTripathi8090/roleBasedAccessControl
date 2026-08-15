import { z } from 'zod';

export const createAuditLogSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceId: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export const queryAuditLogsSchema = z.object({
  user: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
export type QueryAuditLogsInput = z.infer<typeof queryAuditLogsSchema>;
