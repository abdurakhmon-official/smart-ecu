import type { CreateEcuFileInput, CreateTuningOrderInput, EcuFileOutput, TuningOrderOutput, TuningOrderQuery } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class MyTuningOrderService extends BaseService<TuningOrderOutput, CreateTuningOrderInput, never> {
  protected BASE_PATH = 'my-tuning-orders';

  async list(query: Partial<TuningOrderQuery> = {}): Promise<Paged<TuningOrderOutput>> {
    return this.sendGetPaged<TuningOrderOutput>('', query);
  }

  async cancel(id: string): Promise<TuningOrderOutput> {
    return this.sendPut<TuningOrderOutput>(`/${id}/cancel`, {});
  }

  async uploadFile(id: string, input: CreateEcuFileInput): Promise<EcuFileOutput> {
    return this.sendPost<EcuFileOutput, CreateEcuFileInput>(`/${id}/files`, input);
  }
}

export const myTuningOrderService = new MyTuningOrderService();
