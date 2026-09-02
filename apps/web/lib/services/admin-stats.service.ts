import type { AdminStatsOutput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class AdminStatsService extends BaseService<AdminStatsOutput, never, never> {
  protected BASE_PATH = 'admin/stats';

  async getStats(): Promise<AdminStatsOutput> {
    return this.sendGet<AdminStatsOutput>('');
  }
}

export const adminStatsService = new AdminStatsService();
