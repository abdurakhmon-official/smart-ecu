'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrderInput, CreateReviewInput, OrderQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { myOrdersService } from '@/lib/services';

export const useMyOrders = (query: Partial<OrderQuery> = {}, enabled = true) => {
  return useQuery({ queryKey: queryKeys.myOrders(query), queryFn: () => myOrdersService.list(query), enabled });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => myOrdersService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myOrdersBase }),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => myOrdersService.cancel(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myOrdersBase }),
  });
};

export const useReviewOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: CreateReviewInput }) => myOrdersService.review(orderId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myOrdersBase }),
  });
};
