'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminAuditLogQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { auditLogService } from '@/lib/services';

export const useAuditLog = (query: Partial<AdminAuditLogQuery> = {}) => {
  return useQuery({ queryKey: queryKeys.adminAuditLog(query), queryFn: () => auditLogService.list(query) });
};
