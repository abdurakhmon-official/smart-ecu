import type { AdminReviewQuery, ReviewOutput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class AdminReviewService extends BaseService<ReviewOutput, never, never> {
  protected BASE_PATH = 'admin/reviews';

  async list(query: Partial<AdminReviewQuery> = {}): Promise<Paged<ReviewOutput>> {
    return this.sendGetPaged<ReviewOutput>('', query);
  }
}

export const adminReviewService = new AdminReviewService();
