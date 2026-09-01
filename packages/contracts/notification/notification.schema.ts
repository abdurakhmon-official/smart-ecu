import { z } from 'zod';

// schemas

export const NotificationTypeSchema = z.enum([
  'ORDER_RECEIVED',
  'ORDER_ACCEPTED',
  'ORDER_COMPLETED',
  'ORDER_CANCELLED',
  'REVIEW_RECEIVED',
]);

export const NotificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

// types

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

// interfaces

/** `title`/`body` yo'q — matn serverdan qaytmaydi, frontend `type` bo'yicha tarjima qiladi. */
export interface NotificationOutput {
  id: string;
  type: NotificationType;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}
