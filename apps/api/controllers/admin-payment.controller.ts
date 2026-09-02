import { Controller, Inject } from '@tsed/di';
import { QueryParams } from '@tsed/platform-params';
import { Get } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { SubscriptionService } from '@/services/subscription.service';

@Controller('/admin/payments')
export class AdminPaymentController {
  @Inject()
  private subscriptionService!: SubscriptionService;

  @Get('/')
  @Authorized(AdminOnly())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.subscriptionService.adminList(query);
  }
}
