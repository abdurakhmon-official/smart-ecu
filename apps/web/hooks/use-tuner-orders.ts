'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateEcuFileInput, SetTuningResultsInput, TuningOrderQuery, UpdateTuningOrderStatusInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { tunerOrderService } from '@/lib/services';

export const useTunerOrders = (query: Partial<TuningOrderQuery> = {}, enabled = true) => {
  return useQuery({ queryKey: queryKeys.tunerOrders(query), queryFn: () => tunerOrderService.list(query), enabled });
};

export const useUpdateTuningOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTuningOrderStatusInput }) => tunerOrderService.updateStatus(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tunerOrdersBase }),
  });
};

export const useSetTuningResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SetTuningResultsInput }) => tunerOrderService.setResults(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tunerOrdersBase }),
  });
};

export const useUploadTunerEcuFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateEcuFileInput }) => tunerOrderService.uploadFile(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tunerOrdersBase }),
  });
};
