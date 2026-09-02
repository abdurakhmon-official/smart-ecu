import type { InitiatePaymentInput, InitiatePaymentOutput, PaymentOutput, SubscriptionOutput, SubscriptionPlanInfo } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class SubscriptionService extends BaseService<SubscriptionOutput, never, never> {
  protected BASE_PATH = 'my-subscription';

  async plans(): Promise<SubscriptionPlanInfo[]> {
    return this.sendGet<SubscriptionPlanInfo[]>('/plans');
  }

  async getMine(): Promise<SubscriptionOutput> {
    return this.sendGet<SubscriptionOutput>('');
  }

  async myPayments(): Promise<PaymentOutput[]> {
    return this.sendGet<PaymentOutput[]>('/payments');
  }

  async checkout(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return this.sendPost<InitiatePaymentOutput, InitiatePaymentInput>('/checkout', input);
  }
}

export const subscriptionService = new SubscriptionService();
