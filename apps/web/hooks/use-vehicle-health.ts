'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { vehicleHealthService } from '@/lib/services';

export const useVehicleHealthScore = (vehicleId: string) => {
  return useQuery({ queryKey: queryKeys.vehicleHealthScore(vehicleId), queryFn: () => vehicleHealthService.getScore(vehicleId) });
};
