import { Controller, Inject } from '@tsed/di';
import { BodyParams } from '@tsed/platform-params';
import { Post } from '@tsed/schema';
import { ClickService } from '@/services/click.service';

// types

interface ClickWebhookBody {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string;
  amount: string;
  action: string;
  sign_time: string;
  sign_string: string;
}

/** Click'ning o'zi chaqiradigan webhook'lar — `@Authorized()` yo'q, `sign_string` imzosi tekshiradi. */
@Controller('/payments/click')
export class ClickController {
  @Inject()
  private clickService!: ClickService;

  @Post('/prepare')
  async prepare(@BodyParams() body: ClickWebhookBody) {
    return this.clickService.prepare(body);
  }

  @Post('/complete')
  async complete(@BodyParams() body: ClickWebhookBody) {
    return this.clickService.complete(body);
  }
}
