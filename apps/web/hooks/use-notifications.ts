'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { notificationService } from '@/lib/services';

export const useNotifications = (query: Partial<NotificationQuery> = {}, enabled = true) => {
  return useQuery({ queryKey: queryKeys.notifications(query), queryFn: () => notificationService.list(query), enabled });
};

export const useUnreadCount = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: () => notificationService.unreadCount(),
    enabled,
    refetchInterval: 30_000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsBase });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsBase });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
};
