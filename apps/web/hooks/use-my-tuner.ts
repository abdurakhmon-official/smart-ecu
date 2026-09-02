'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTunerProfileInput, UpdateTunerProfileInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { myTunerService } from '@/lib/services';

export const useMyTuner = (enabled = true) => {
  return useQuery({ queryKey: queryKeys.myTunerBase, queryFn: () => myTunerService.getMine(), enabled });
};

export const useApplyAsTuner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTunerProfileInput) => myTunerService.apply(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myTunerBase }),
  });
};

export const useUpdateMyTuner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTunerProfileInput) => myTunerService.updateMine(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myTunerBase }),
  });
};
