import type { AdminPaymentQuery, PaymentOutput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class AdminPaymentService extends BaseService<PaymentOutput, never, never> {
  protected BASE_PATH = 'admin/payments';

  async list(query: Partial<AdminPaymentQuery> = {}): Promise<Paged<PaymentOutput>> {
    return this.sendGetPaged<PaymentOutput>('', query);
  }
}

export const adminPaymentService = new AdminPaymentService();
