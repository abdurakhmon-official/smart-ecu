import { z } from 'zod';

// schemas

export const SubscriptionPlanSchema = z.enum(['FREE', 'PRO', 'BUSINESS']);
export const SubscriptionStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']);
export const PaymentProviderSchema = z.enum(['PAYME', 'CLICK']);
export const PaymentStatusSchema = z.enum(['PENDING', 'PAID', 'CANCELLED', 'FAILED']);

export const InitiatePaymentInputSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
  provider: PaymentProviderSchema,
});

export const AdminPaymentQuerySchema = z.object({
  status: PaymentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

// types

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentInputSchema>;
export type AdminPaymentQuery = z.infer<typeof AdminPaymentQuerySchema>;

// interfaces

/** Narxlar boshlang'ich taxminiy qiymatlar — hozircha kod ichida qattiq belgilangan, admin-boshqaruvga keyinroq o'tkaziladi. */
export interface SubscriptionPlanInfo {
  plan: SubscriptionPlan;
  priceSom: number;
  periodDays: number;
}

export interface SubscriptionOutput {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
}

export interface InitiatePaymentOutput {
  paymentId: string;
  checkoutUrl: string;
}

export interface PaymentOutput {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  provider: PaymentProvider;
  providerTransactionId: string | null;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}
