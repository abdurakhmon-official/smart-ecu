'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminTunerQuery, TunerQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { tunerService } from '@/lib/services';

export const useTuners = (query: Partial<TunerQuery> = {}) => {
  return useQuery({ queryKey: queryKeys.tuners(query), queryFn: () => tunerService.list(query) });
};

export const useTuner = (id: string) => {
  return useQuery({ queryKey: queryKeys.tuner(id), queryFn: () => tunerService.get(id) });
};

export const useAdminTuners = (query: Partial<AdminTunerQuery> = {}) => {
  return useQuery({ queryKey: queryKeys.adminTuners(query), queryFn: () => tunerService.adminList(query) });
};

export const useVerifyTuner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tunerService.verify(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminTunersBase }),
  });
};

export const useSuspendTuner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tunerService.suspend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminTunersBase }),
  });
};
