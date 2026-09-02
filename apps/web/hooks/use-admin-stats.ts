'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { adminStatsService } from '@/lib/services';

export const useAdminStats = () => {
  return useQuery({ queryKey: queryKeys.adminStats, queryFn: () => adminStatsService.getStats() });
};
