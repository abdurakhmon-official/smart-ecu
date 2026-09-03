import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { NOTIFICATION_TYPE, Prisma, USER_ROLE } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import type { BroadcastNotificationInput, NotificationQuery } from '@/inputs/notification.input';
import { NotificationQuerySchema } from '@/inputs/notification.input';
import { NotificationNotFoundException } from '@/exceptions/notification.exceptions';
import { AuditLogService } from '@/services/audit-log.service';
import { TelegramService } from '@/services/telegram.service';

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

  @Inject()
  private auditLogService!: AuditLogService;

  @Inject()
  private telegramService!: TelegramService;

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

  async create(params: CreateNotificationParams): Promise<void> {
    await prisma.notification.create({ data: params });

    this.telegramService.notify(params.userId, params.type).catch(() => undefined);
  }

  async broadcast(input: BroadcastNotificationInput) {
    const where = input.role === 'ALL' ? {} : { role: input.role as USER_ROLE };
    const recipients = await prisma.user.findMany({
      where: { ...where, deletedAt: null, active: true },
      select: { id: true },
    });

    if (recipients.length) {
      await prisma.notification.createMany({
        data: recipients.map((recipient) => ({
          userId: recipient.id,
          type: NOTIFICATION_TYPE.ADMIN_BROADCAST,
          broadcastMessage: input.message as Prisma.InputJsonValue,
        })),
      });
    }

    await this.auditLogService.record({
      actorId: this.currentUserId,
      action: 'NOTIFICATION_BROADCAST_SENT',
      targetType: 'Notification',
      metadata: { role: input.role, recipientCount: recipients.length },
    });

    void Promise.all(recipients.map((recipient) => this.telegramService.notifyBroadcast(recipient.id, input.message).catch(() => undefined)));

    return ok({ recipientCount: recipients.length });
  }

  private static serialize<T extends { createdAt: Date; readAt: Date | null }>(notification: T) {
    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
    };
  }
}
