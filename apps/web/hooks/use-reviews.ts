'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reviewService } from '@/lib/services';

export const useProviderReviews = (serviceProviderId: string, page = 1) => {
  return useQuery({
    queryKey: queryKeys.reviews(serviceProviderId, page),
    queryFn: () => reviewService.listForProvider(serviceProviderId, page),
  });
};
