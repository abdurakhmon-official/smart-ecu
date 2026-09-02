import type { AdminOrderQuery, OrderOutput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class AdminOrderService extends BaseService<OrderOutput, never, never> {
  protected BASE_PATH = 'admin/orders';

  async list(query: Partial<AdminOrderQuery> = {}): Promise<Paged<OrderOutput>> {
    return this.sendGetPaged<OrderOutput>('', query);
  }
}

export const adminOrderService = new AdminOrderService();
