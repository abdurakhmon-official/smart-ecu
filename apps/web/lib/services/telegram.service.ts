import { BaseService } from '@/lib/services/base.service';

interface TelegramLinkCode {
  code: string;
  deepLink: string;
}

class TelegramService extends BaseService<never, never, never> {
  protected BASE_PATH = 'my-telegram';

  async createLinkCode(): Promise<TelegramLinkCode> {
    return this.sendPost<TelegramLinkCode, Record<string, never>>('/link-code', {});
  }

  async unlink(): Promise<null> {
    return this.sendDelete<null>('');
  }
}

export const telegramService = new TelegramService();
