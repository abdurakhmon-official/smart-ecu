import { Inject, Injectable } from '@tsed/di';
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '../generated/prisma';
import { somToTiyin } from '@/modules/payme';
import { SubscriptionService } from '@/services/subscription.service';

// types

interface PaymeParams {
  id?: string;
  time?: number;
  amount?: number;
  account?: { order_id?: string };
  reason?: number;
}

/**
 * Payme JSON-RPC xatosi — controller `error.code`/`error.message`ni to'g'ridan-to'g'ri
 * javob tanasiga yozadi (Ts.ED'ning odatiy `{success,data}` konvertidan chetlab o'tadi).
 */
export class PaymeRpcError extends Error {
  constructor(
    readonly code: number,
    readonly data?: Record<string, string>,
  ) {
    super(`Payme RPC error ${code}`);
  }
}

/**
 * `CreateTransaction`ning aniq maydonlari (WebFetch orqali tasdiqlangan) bo'yicha
 * qurilgan; qolgan metodlar (`Perform`/`Cancel`/`CheckTransaction`) Payme'ning
 * yillar davomida barqaror bo'lgan umumiy naqshiga asoslangan — jonli sandbox
 * kredentsial kelgach real so'rovlar bilan tekshirilishi kerak.
 */
@Injectable()
export class PaymeService {
  @Inject()
  private subscriptionService!: SubscriptionService;

  async handle(method: string, params: PaymeParams): Promise<unknown> {
    switch (method) {
      case 'CheckPerformTransaction':
        return this.checkPerformTransaction(params);
      case 'CreateTransaction':
        return this.createTransaction(params);
      case 'PerformTransaction':
        return this.performTransaction(params);
      case 'CancelTransaction':
        return this.cancelTransaction(params);
      case 'CheckTransaction':
        return this.checkTransaction(params);
      default:
        throw new PaymeRpcError(-32601);
    }
  }

  private async checkPerformTransaction(params: PaymeParams) {
    const payment = await this.getOrderOrThrow(params.account?.order_id);

    if (payment.status !== PAYMENT_STATUS.PENDING) throw new PaymeRpcError(-31008);
    if (params.amount !== somToTiyin(payment.amount)) throw new PaymeRpcError(-31001);

    return { allow: true };
  }

  private async createTransaction(params: PaymeParams) {
    const payment = await this.getOrderOrThrow(params.account?.order_id);
    if (params.amount !== somToTiyin(payment.amount)) throw new PaymeRpcError(-31001);

    // Idempotentlik: bir xil `id` bilan qayta so'rov kelsa, yangi holat yaratmasdan mavjudini qaytaradi.
    if (payment.providerTransactionId && payment.providerTransactionId !== params.id) {
      throw new PaymeRpcError(-31008);
    }

    if (!payment.providerTransactionId) {
      await this.subscriptionService.attachProviderTransaction(payment.id, params.id ?? '');
    }

    return {
      create_time: payment.createdAt.getTime(),
      transaction: payment.id,
      state: PaymeService.toPaymeState(payment.status),
    };
  }

  private async performTransaction(params: PaymeParams) {
    const payment = await this.getByTransactionIdOrThrow(params.id);

    if (payment.status === PAYMENT_STATUS.PENDING) {
      await this.subscriptionService.markPaid(payment.id, params.id ?? '');
    }

    const updated = await this.subscriptionService.findPendingPayment(payment.id);

    return {
      transaction: payment.id,
      perform_time: updated?.updatedAt.getTime() ?? Date.now(),
      state: PaymeService.toPaymeState(updated?.status ?? payment.status),
    };
  }

  private async cancelTransaction(params: PaymeParams) {
    const payment = await this.getByTransactionIdOrThrow(params.id);

    if (payment.status === PAYMENT_STATUS.PENDING) {
      await this.subscriptionService.cancelPayment(payment.id);
    }

    return {
      transaction: payment.id,
      cancel_time: Date.now(),
      state: payment.status === PAYMENT_STATUS.PAID ? -2 : -1,
    };
  }

  private async checkTransaction(params: PaymeParams) {
    const payment = await this.getByTransactionIdOrThrow(params.id);

    return {
      create_time: payment.createdAt.getTime(),
      perform_time: payment.status === PAYMENT_STATUS.PAID ? payment.updatedAt.getTime() : 0,
      cancel_time: payment.status === PAYMENT_STATUS.CANCELLED ? payment.updatedAt.getTime() : 0,
      transaction: payment.id,
      state: PaymeService.toPaymeState(payment.status),
      reason: null,
    };
  }

  private async getOrderOrThrow(orderId: string | undefined) {
    if (!orderId) throw new PaymeRpcError(-31050, { order_id: 'Required' });

    const payment = await this.subscriptionService.findPendingPayment(orderId);
    if (!payment || payment.provider !== PAYMENT_PROVIDER.PAYME) {
      throw new PaymeRpcError(-31050, { order_id: 'Order not found' });
    }

    return payment;
  }

  private async getByTransactionIdOrThrow(transactionId: string | undefined) {
    if (!transactionId) throw new PaymeRpcError(-31003);

    const payment = await this.subscriptionService.findByProviderTransactionId(PAYMENT_PROVIDER.PAYME, transactionId);
    if (!payment) throw new PaymeRpcError(-31003);

    return payment;
  }

  private static toPaymeState(status: PAYMENT_STATUS): number {
    if (status === PAYMENT_STATUS.PAID) return 2;
    if (status === PAYMENT_STATUS.CANCELLED || status === PAYMENT_STATUS.FAILED) return -1;
    return 1;
  }
}
