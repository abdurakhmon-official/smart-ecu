'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { serviceOrderService } from '@/lib/services';

export const useServiceOrders = (query: Partial<OrderQuery> = {}, enabled = true) => {
  return useQuery({ queryKey: queryKeys.serviceOrders(query), queryFn: () => serviceOrderService.list(query), enabled });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => serviceOrderService.accept(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceOrdersBase }),
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => serviceOrderService.complete(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceOrdersBase }),
  });
};
