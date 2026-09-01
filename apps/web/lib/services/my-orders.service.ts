import type { OrderOutput, CreateOrderInput, OrderQuery, CreateReviewInput, ReviewOutput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class MyOrdersService extends BaseService<OrderOutput, CreateOrderInput, never> {
  protected BASE_PATH = 'my-orders';

  async list(query: Partial<OrderQuery> = {}): Promise<Paged<OrderOutput>> {
    return this.sendGetPaged<OrderOutput>('', query);
  }

  async cancel(orderId: string) {
    return this.sendPut<OrderOutput>(`/${orderId}/cancel`, {});
  }

  async review(orderId: string, input: CreateReviewInput) {
    return this.sendPost<ReviewOutput, CreateReviewInput>(`/${orderId}/review`, input);
  }
}

export const myOrdersService = new MyOrdersService();
