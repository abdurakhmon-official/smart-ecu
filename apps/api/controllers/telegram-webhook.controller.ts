import { Controller, Inject } from '@tsed/di';
import { BodyParams, QueryParams } from '@tsed/platform-params';
import { Post } from '@tsed/schema';
import config from '@/config';
import { TelegramService } from '@/services/telegram.service';

// types

interface TelegramUpdateBody {
  message?: {
    chat?: { id: number };
    text?: string;
  };
}

/**
 * Telegram'ning o'zi chaqiradigan webhook — himoya webhook URL'ning o'ziga qo'shiladigan
 * `?secret=` parametri orqali (Telegram `setWebhook`da `secret_token` ham qo'llab-quvvatlaydi,
 * lekin soddalik uchun query-parametr yetarli — bot hali ulanmagan, `TELEGRAM_WEBHOOK_SECRET`
 * bo'sh bo'lsa so'rov rad etiladi).
 */
@Controller('/telegram')
export class TelegramWebhookController {
  @Inject()
  private telegramService!: TelegramService;

  @Post('/webhook')
  async webhook(@BodyParams() body: TelegramUpdateBody, @QueryParams('secret') secret: string) {
    if (!config.telegram.webhookSecret || secret !== config.telegram.webhookSecret) {
      return { ok: false };
    }

    await this.telegramService.handleWebhookUpdate(body);
    return { ok: true };
  }
}
