'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { telegramService } from '@/lib/services';

export const useCreateTelegramLinkCode = () => {
  return useMutation({ mutationFn: () => telegramService.createLinkCode() });
};

export const useUnlinkTelegram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => telegramService.unlink(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};
