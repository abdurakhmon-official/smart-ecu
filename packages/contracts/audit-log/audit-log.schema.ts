import { z } from 'zod';

// schemas

export const AdminAuditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().trim().min(1).optional(),
  targetType: z.string().trim().min(1).optional(),
});

// types

export type AdminAuditLogQuery = z.infer<typeof AdminAuditLogQuerySchema>;

// interfaces

export interface AuditLogOutput {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
  actorFullName: string;
  actorEmail: string;
}
