'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminPaymentQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { adminPaymentService } from '@/lib/services';

export const useAdminPayments = (query: Partial<AdminPaymentQuery> = {}) => {
  return useQuery({ queryKey: queryKeys.adminPayments(query), queryFn: () => adminPaymentService.list(query) });
};
