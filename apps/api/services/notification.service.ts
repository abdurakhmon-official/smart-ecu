import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { NOTIFICATION_TYPE } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import type { NotificationQuery } from '@/inputs/notification.input';
import { NotificationQuerySchema } from '@/inputs/notification.input';
import { NotificationNotFoundException } from '@/exceptions/notification.exceptions';

// types

interface CreateNotificationParams {
  userId: string;
  type: NOTIFICATION_TYPE;
  orderId?: string;
}

@Injectable()
export class NotificationService {
  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async list(rawQuery: unknown) {
    const { page, size } = NotificationQuerySchema.parse(rawQuery);
    const userId = this.currentUserId;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return ok(notifications.map(NotificationService.serialize), { meta: { page, limit: size, total } });
  }

  async unreadCount() {
    const count = await prisma.notification.count({ where: { userId: this.currentUserId, readAt: null } });
    return ok({ count });
  }

  async markRead(notificationId: string) {
    const userId = this.currentUserId;
    const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notification) throw new NotificationNotFoundException(notificationId);

    const updated = await prisma.notification.update({ where: { id: notificationId }, data: { readAt: new Date() } });
    return ok(NotificationService.serialize(updated));
  }

  async markAllRead() {
    await prisma.notification.updateMany({
      where: { userId: this.currentUserId, readAt: null },
      data: { readAt: new Date() },
    });
    return ok(null);
  }

  /** Boshqa servislar (Order, Review) tomonidan chaqiriladigan ichki metod — controller'ga bevosita ochilmagan. */
  async create(params: CreateNotificationParams): Promise<void> {
    await prisma.notification.create({ data: params });
  }

  private static serialize<T extends { createdAt: Date; readAt: Date | null }>(notification: T) {
    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
    };
  }
}
