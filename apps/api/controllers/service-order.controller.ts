import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Put } from '@tsed/schema';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { ServiceOrderService } from '@/services/service-order.service';

@Controller('/my-service/orders')
export class ServiceOrderController {
  @Inject()
  private serviceOrderService!: ServiceOrderService;

  @Get('/')
  @Authorized(Authenticate())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.serviceOrderService.list(query);
  }

  @Put('/:id/accept')
  @Authorized(Authenticate())
  async accept(@PathParams('id') id: string) {
    return this.serviceOrderService.accept(id);
  }

  @Put('/:id/complete')
  @Authorized(Authenticate())
  async complete(@PathParams('id') id: string) {
    return this.serviceOrderService.complete(id);
  }
}
