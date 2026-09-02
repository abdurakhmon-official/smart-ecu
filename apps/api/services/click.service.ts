import { Inject, Injectable } from '@tsed/di';
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '../generated/prisma';
import { CLICK_ERROR, verifyClickCompleteSignature, verifyClickPrepareSignature } from '@/modules/click';
import { SubscriptionService } from '@/services/subscription.service';

// types

interface ClickWebhookParams {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string;
  amount: string;
  action: string;
  sign_time: string;
  sign_string: string;
}

export interface ClickResponse {
  click_trans_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string;
  merchant_confirm_id?: string;
  error: number;
  error_note: string;
}

/**
 * Click.uz Shop API — Prepare/Complete. `@/modules/click`dagi kabi, jonli hujjatlar
 * orqali to'liq tasdiqlanmagan (keng tarqalgan, barqaror naqshga asoslangan);
 * sandbox kredentsial kelgach tekshirilishi kerak.
 */
@Injectable()
export class ClickService {
  @Inject()
  private subscriptionService!: SubscriptionService;

  async prepare(params: ClickWebhookParams): Promise<ClickResponse> {
    const base = { click_trans_id: params.click_trans_id, merchant_trans_id: params.merchant_trans_id };

    if (!verifyClickPrepareSignature(ClickService.toSignParams(params), params.sign_string)) {
      return { ...base, error: CLICK_ERROR.SIGN_CHECK_FAILED, error_note: 'Invalid signature' };
    }

    const payment = await this.subscriptionService.findPendingPayment(params.merchant_trans_id);
    if (!payment || payment.provider !== PAYMENT_PROVIDER.CLICK) {
      return { ...base, error: CLICK_ERROR.TRANSACTION_NOT_FOUND, error_note: 'Order not found' };
    }

    if (Number(params.amount) !== payment.amount) {
      return { ...base, error: CLICK_ERROR.INCORRECT_AMOUNT, error_note: 'Incorrect amount' };
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      return { ...base, error: CLICK_ERROR.ALREADY_PAID, error_note: 'Already paid' };
    }

    return { ...base, merchant_prepare_id: payment.id, error: CLICK_ERROR.SUCCESS, error_note: 'Success' };
  }

  async complete(params: ClickWebhookParams): Promise<ClickResponse> {
    const base = { click_trans_id: params.click_trans_id, merchant_trans_id: params.merchant_trans_id };

    if (
      !params.merchant_prepare_id ||
      !verifyClickCompleteSignature(
        { ...ClickService.toSignParams(params), merchantPrepareId: params.merchant_prepare_id },
        params.sign_string,
      )
    ) {
      return { ...base, error: CLICK_ERROR.SIGN_CHECK_FAILED, error_note: 'Invalid signature' };
    }

    const payment = await this.subscriptionService.findPendingPayment(params.merchant_trans_id);
    if (!payment || payment.provider !== PAYMENT_PROVIDER.CLICK) {
      return { ...base, error: CLICK_ERROR.TRANSACTION_NOT_FOUND, error_note: 'Order not found' };
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      return { ...base, merchant_confirm_id: payment.id, error: CLICK_ERROR.ALREADY_PAID, error_note: 'Already confirmed' };
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      return { ...base, error: CLICK_ERROR.TRANSACTION_CANCELLED, error_note: 'Transaction is not payable' };
    }

    await this.subscriptionService.markPaid(payment.id, params.click_trans_id);

    return { ...base, merchant_confirm_id: payment.id, error: CLICK_ERROR.SUCCESS, error_note: 'Success' };
  }

  private static toSignParams(params: ClickWebhookParams) {
    return {
      clickTransId: params.click_trans_id,
      serviceId: params.service_id,
      merchantTransId: params.merchant_trans_id,
      amount: params.amount,
      action: params.action,
      signTime: params.sign_time,
    };
  }
}
