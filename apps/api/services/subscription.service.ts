import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import type { SubscriptionPlanInfo } from '@repo/contracts';
import prisma from '@/modules/db';
import config from '@/config';
import { PAYMENT_PROVIDER, PAYMENT_STATUS, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { buildPaymeCheckoutUrl } from '@/modules/payme';
import { buildClickCheckoutUrl } from '@/modules/click';
import type { AdminPaymentQuery, InitiatePaymentInput } from '@/inputs/subscription.input';
import { AdminPaymentQuerySchema } from '@/inputs/subscription.input';
import { PaymentProviderNotConfiguredException } from '@/exceptions/billing.exceptions';

@Injectable()
export class SubscriptionService {
  private static readonly PLAN_PRICES: Record<SUBSCRIPTION_PLAN, SubscriptionPlanInfo> = {
    FREE: { plan: 'FREE', priceSom: 0, periodDays: 0 },
    PRO: { plan: 'PRO', priceSom: 99_000, periodDays: 30 },
    BUSINESS: { plan: 'BUSINESS', priceSom: 249_000, periodDays: 30 },
  };

  private static readonly PERIOD_DAYS = 30;

  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  plans() {
    return ok(Object.values(SubscriptionService.PLAN_PRICES));
  }

  async getMine() {
    const subscription = await prisma.subscription.findUnique({ where: { userId: this.currentUserId } });

    return ok(
      subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
          }
        : { plan: SUBSCRIPTION_PLAN.FREE, status: SUBSCRIPTION_STATUS.ACTIVE, currentPeriodEnd: null },
    );
  }

  async initiatePayment(input: InitiatePaymentInput) {
    const info = SubscriptionService.PLAN_PRICES[input.plan];

    SubscriptionService.assertProviderConfigured(input.provider);

    const payment = await prisma.payment.create({
      data: {
        userId: this.currentUserId,
        plan: input.plan,
        provider: input.provider,
        amount: info.priceSom,
        status: PAYMENT_STATUS.PENDING,
      },
    });

    const checkoutUrl = SubscriptionService.buildCheckoutUrl(input.provider, payment.id, info.priceSom);

    return ok({ paymentId: payment.id, checkoutUrl });
  }

  async myPayments() {
    const payments = await prisma.payment.findMany({ where: { userId: this.currentUserId }, orderBy: { createdAt: 'desc' } });
    return ok(payments.map(SubscriptionService.serializePayment));
  }

  async adminList(rawQuery: unknown) {
    const { status, page, size }: AdminPaymentQuery = AdminPaymentQuerySchema.parse(rawQuery);
    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.payment.count({ where }),
    ]);

    return ok(payments.map(SubscriptionService.serializePayment), { meta: { page, limit: size, total } });
  }

  async markPaid(paymentId: string, providerTransactionId: string): Promise<void> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status === PAYMENT_STATUS.PAID) return;

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + SubscriptionService.PERIOD_DAYS);

    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: PAYMENT_STATUS.PAID, providerTransactionId } }),
      prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: { userId: payment.userId, plan: payment.plan, status: SUBSCRIPTION_STATUS.ACTIVE, currentPeriodEnd: periodEnd },
        update: { plan: payment.plan, status: SUBSCRIPTION_STATUS.ACTIVE, currentPeriodEnd: periodEnd },
      }),
    ]);
  }

  async findPendingPayment(paymentId: string) {
    return prisma.payment.findUnique({ where: { id: paymentId } });
  }

  async findByProviderTransactionId(provider: PAYMENT_PROVIDER, providerTransactionId: string) {
    return prisma.payment.findFirst({ where: { provider, providerTransactionId } });
  }

  async attachProviderTransaction(paymentId: string, providerTransactionId: string): Promise<void> {
    await prisma.payment.update({ where: { id: paymentId }, data: { providerTransactionId } });
  }

  async cancelPayment(paymentId: string): Promise<void> {
    await prisma.payment.updateMany({
      where: { id: paymentId, status: PAYMENT_STATUS.PENDING },
      data: { status: PAYMENT_STATUS.CANCELLED },
    });
  }

  private static assertProviderConfigured(provider: PAYMENT_PROVIDER): void {
    if (provider === PAYMENT_PROVIDER.PAYME && !config.payme.merchantId) throw new PaymentProviderNotConfiguredException('Payme');
    if (provider === PAYMENT_PROVIDER.CLICK && !config.click.merchantId) throw new PaymentProviderNotConfiguredException('Click');
  }

  private static buildCheckoutUrl(provider: PAYMENT_PROVIDER, paymentId: string, amountSom: number): string {
    return provider === PAYMENT_PROVIDER.PAYME
      ? buildPaymeCheckoutUrl(paymentId, amountSom)
      : buildClickCheckoutUrl(paymentId, amountSom);
  }

  private static serializePayment(payment: {
    id: string;
    userId: string;
    plan: SUBSCRIPTION_PLAN;
    provider: PAYMENT_PROVIDER;
    providerTransactionId: string | null;
    amount: number;
    status: PAYMENT_STATUS;
    createdAt: Date;
  }) {
    return {
      id: payment.id,
      userId: payment.userId,
      plan: payment.plan,
      provider: payment.provider,
      providerTransactionId: payment.providerTransactionId,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
