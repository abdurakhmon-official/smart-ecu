import type { AdminTunerQuery, TunerProfileOutput, TunerQuery } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class TunerService extends BaseService<TunerProfileOutput, never, never> {
  protected BASE_PATH = 'tuners';

  async list(query: Partial<TunerQuery> = {}): Promise<Paged<TunerProfileOutput>> {
    return this.sendGetPaged<TunerProfileOutput>('', query);
  }

  async adminList(query: Partial<AdminTunerQuery> = {}): Promise<Paged<TunerProfileOutput>> {
    return this.sendGetPaged<TunerProfileOutput>('/admin', query);
  }

  async verify(id: string) {
    return this.sendPut<TunerProfileOutput>(`/${id}/verify`, {});
  }

  async suspend(id: string) {
    return this.sendPut<TunerProfileOutput>(`/${id}/suspend`, {});
  }
}

export const tunerService = new TunerService();
