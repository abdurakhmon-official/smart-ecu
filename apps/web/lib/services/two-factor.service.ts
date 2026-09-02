import type { ApiResponse, TwoFactorCodeInput, TwoFactorEnableOutput, TwoFactorSetupOutput } from '@repo/contracts';
import api from '@/lib/axios';
import { BaseService } from '@/lib/services/base.service';

class TwoFactorService extends BaseService<never, never, never> {
  protected BASE_PATH = 'auth/2fa';

  async setup(): Promise<TwoFactorSetupOutput> {
    return this.sendPost<TwoFactorSetupOutput, Record<string, never>>('/setup', {});
  }

  async enable(input: TwoFactorCodeInput): Promise<TwoFactorEnableOutput> {
    return this.sendPost<TwoFactorEnableOutput, TwoFactorCodeInput>('/enable', input);
  }

  /** `BaseService.sendDelete` bodysiz — bu yerda kod tasdiqlash kerak, shuning uchun `api`dan to'g'ridan-to'g'ri foydalanildi. */
  async disable(input: TwoFactorCodeInput): Promise<null> {
    const { data } = await api.delete<ApiResponse<null>>(`/${this.BASE_PATH}`, { data: input });
    return data.data;
  }
}

export const twoFactorService = new TwoFactorService();
