'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTuningOrderInput, TuningOrderQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { myTuningOrderService } from '@/lib/services';

export const useMyTuningOrders = (query: Partial<TuningOrderQuery> = {}, enabled = true) => {
  return useQuery({ queryKey: queryKeys.myTuningOrders(query), queryFn: () => myTuningOrderService.list(query), enabled });
};

export const useCreateTuningOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTuningOrderInput) => myTuningOrderService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myTuningOrdersBase }),
  });
};

export const useCancelTuningOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => myTuningOrderService.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myTuningOrdersBase }),
  });
};
