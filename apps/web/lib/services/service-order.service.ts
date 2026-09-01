import type { OrderOutput, OrderQuery } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class ServiceOrderService extends BaseService<OrderOutput, never, never> {
  protected BASE_PATH = 'my-service/orders';

  async list(query: Partial<OrderQuery> = {}): Promise<Paged<OrderOutput>> {
    return this.sendGetPaged<OrderOutput>('', query);
  }

  async accept(orderId: string) {
    return this.sendPut<OrderOutput>(`/${orderId}/accept`, {});
  }

  async complete(orderId: string) {
    return this.sendPut<OrderOutput>(`/${orderId}/complete`, {});
  }
}

export const serviceOrderService = new ServiceOrderService();
