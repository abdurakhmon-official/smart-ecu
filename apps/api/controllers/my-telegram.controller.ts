import { Controller, Inject } from '@tsed/di';
import { Delete, Post } from '@tsed/schema';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { TelegramService } from '@/services/telegram.service';

@Controller('/my-telegram')
export class MyTelegramController {
  @Inject()
  private telegramService!: TelegramService;

  @Post('/link-code')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async createLinkCode() {
    return this.telegramService.createLinkCode();
  }

  @Delete('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async unlink() {
    return this.telegramService.unlink();
  }
}
