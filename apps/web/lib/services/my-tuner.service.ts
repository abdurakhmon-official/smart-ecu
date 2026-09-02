import type { CreateTunerProfileInput, TunerProfileOutput, UpdateTunerProfileInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class MyTunerService extends BaseService<TunerProfileOutput, CreateTunerProfileInput, UpdateTunerProfileInput> {
  protected BASE_PATH = 'my-tuner';

  async getMine(): Promise<TunerProfileOutput | null> {
    return this.sendGet<TunerProfileOutput | null>('');
  }

  async apply(input: CreateTunerProfileInput): Promise<TunerProfileOutput> {
    return this.sendPost<TunerProfileOutput, CreateTunerProfileInput>('', input);
  }

  async updateMine(input: UpdateTunerProfileInput): Promise<TunerProfileOutput> {
    return this.sendPut<TunerProfileOutput, UpdateTunerProfileInput>('', input);
  }
}

export const myTunerService = new MyTunerService();
