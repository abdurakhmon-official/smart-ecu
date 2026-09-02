'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { twoFactorService } from '@/lib/services';

export const useSetupTwoFactor = () => {
  return useMutation({ mutationFn: () => twoFactorService.setup() });
};

export const useEnableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: twoFactorService.enable.bind(twoFactorService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: twoFactorService.disable.bind(twoFactorService),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};
