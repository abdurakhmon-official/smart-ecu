import { z } from 'zod';
import { LocalizedTextSchema } from '../common/localized-text';
import type { LocalizedText } from '../common/localized-text';

// schemas

export const NotificationTypeSchema = z.enum([
  'ORDER_RECEIVED',
  'ORDER_ACCEPTED',
  'ORDER_COMPLETED',
  'ORDER_CANCELLED',
  'REVIEW_RECEIVED',
  'ADMIN_BROADCAST',
  'TUNING_ORDER_RECEIVED',
  'TUNING_ORDER_STATUS_CHANGED',
]);

export const NotificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const BroadcastRoleSchema = z.enum(['ALL', 'CUSTOMER', 'SERVICE', 'TUNER']);

/** Admin barcha foydalanuvchilarga (yoki bitta rolga) e'lon yuboradi — uz/ru/en'da kiritiladi. */
export const BroadcastNotificationInputSchema = z.object({
  message: LocalizedTextSchema,
  role: BroadcastRoleSchema.default('ALL'),
});

// types

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;
export type BroadcastRole = z.infer<typeof BroadcastRoleSchema>;
export type BroadcastNotificationInput = z.infer<typeof BroadcastNotificationInputSchema>;

// interfaces

/**
 * `title`/`body` yo'q — matn serverdan qaytmaydi, frontend `type` bo'yicha tarjima qiladi.
 * Yagona istisno — `ADMIN_BROADCAST`: bu holatda `broadcastMessage` admin tomonidan
 * uz/ru/en'da yozilgan haqiqiy kontent (`ServiceCatalogItem.description` bilan bir xil pattern).
 */
export interface NotificationOutput {
  id: string;
  type: NotificationType;
  orderId: string | null;
  broadcastMessage: LocalizedText | null;
  readAt: string | null;
  createdAt: string;
}
