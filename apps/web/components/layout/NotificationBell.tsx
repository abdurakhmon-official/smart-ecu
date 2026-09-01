'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NotificationOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadCount } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

const dotClass = (readAt: string | null) => cn('mt-1.5 size-2 shrink-0 rounded-full', readAt ? 'bg-transparent' : 'bg-primary');

export function NotificationBell() {
  const t = useTranslations('nav.notifications');
  const { data: unread } = useUnreadCount();
  const { data: notifications } = useNotifications({ size: 5 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const count = unread?.count ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative size-9 px-0" aria-label={t('title')}>
          <Bell className="size-4.5" />
          {count > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="p-0">{t('title')}</DropdownMenuLabel>
          {count > 0 && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              {t('markAllRead')}
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!notifications?.data.length ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          notifications.data.map((notification: NotificationOutput) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-2"
              onSelect={() => !notification.readAt && markRead.mutate(notification.id)}
            >
              <span className={dotClass(notification.readAt)} />
              <span className="flex-1 text-sm">{t(`types.${notification.type}`)}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
