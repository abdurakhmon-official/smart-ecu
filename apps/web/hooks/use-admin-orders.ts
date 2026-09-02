'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminOrderQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { adminOrderService } from '@/lib/services';

export const useAdminOrders = (query: Partial<AdminOrderQuery> = {}) => {
  return useQuery({ queryKey: queryKeys.adminOrders(query), queryFn: () => adminOrderService.list(query) });
};
