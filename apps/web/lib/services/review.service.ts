import type { ReviewOutput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class ReviewService extends BaseService<ReviewOutput, never, never> {
  protected BASE_PATH = 'service-providers';

  async listForProvider(serviceProviderId: string, page = 1): Promise<Paged<ReviewOutput>> {
    return this.sendGetPaged<ReviewOutput>(`/${serviceProviderId}/reviews`, { page });
  }
}

export const reviewService = new ReviewService();
