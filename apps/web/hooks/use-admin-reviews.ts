'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminReviewQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { adminReviewService } from '@/lib/services';

export const useAdminReviews = (query: Partial<AdminReviewQuery> = {}) => {
  return useQuery({ queryKey: queryKeys.adminReviews(query), queryFn: () => adminReviewService.list(query) });
};

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminReviewService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminReviewsBase }),
  });
};
