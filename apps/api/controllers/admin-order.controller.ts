import { Controller, Inject } from '@tsed/di';
import { QueryParams } from '@tsed/platform-params';
import { Get } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { AdminOrderService } from '@/services/admin-order.service';

@Controller('/admin/orders')
export class AdminOrderController {
  @Inject()
  private adminOrderService!: AdminOrderService;

  @Get('/')
  @Authorized(AdminOnly())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.adminOrderService.list(query);
  }
}
