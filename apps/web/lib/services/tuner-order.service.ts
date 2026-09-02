import type {
  CreateEcuFileInput,
  EcuFileOutput,
  SetTuningResultsInput,
  TuningOrderOutput,
  TuningOrderQuery,
  UpdateTuningOrderStatusInput,
} from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class TunerOrderService extends BaseService<TuningOrderOutput, never, never> {
  protected BASE_PATH = 'my-tuner/orders';

  async list(query: Partial<TuningOrderQuery> = {}): Promise<Paged<TuningOrderOutput>> {
    return this.sendGetPaged<TuningOrderOutput>('', query);
  }

  async updateStatus(id: string, input: UpdateTuningOrderStatusInput): Promise<TuningOrderOutput> {
    return this.sendPut<TuningOrderOutput, UpdateTuningOrderStatusInput>(`/${id}/status`, input);
  }

  async setResults(id: string, input: SetTuningResultsInput): Promise<TuningOrderOutput> {
    return this.sendPut<TuningOrderOutput, SetTuningResultsInput>(`/${id}/results`, input);
  }

  async uploadFile(id: string, input: CreateEcuFileInput): Promise<EcuFileOutput> {
    return this.sendPost<EcuFileOutput, CreateEcuFileInput>(`/${id}/files`, input);
  }
}

export const tunerOrderService = new TunerOrderService();
