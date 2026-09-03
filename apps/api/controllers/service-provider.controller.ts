import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Put } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { ReviewService } from '@/services/review.service';
import { ServiceProviderService } from '@/services/service-provider.service';

@Controller('/service-providers')
export class ServiceProviderController {
  @Inject()
  private serviceProviderService!: ServiceProviderService;

  @Inject()
  private reviewService!: ReviewService;

  @Get('/')
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.serviceProviderService.list(query);
  }

  @Get('/admin')
  @Authorized(AdminOnly())
  async adminList(@QueryParams() query: Record<string, unknown>) {
    return this.serviceProviderService.adminList(query);
  }

  @Get('/:id')
  async getById(@PathParams('id') id: string) {
    return this.serviceProviderService.getById(id);
  }

  @Get('/:id/reviews')
  async reviews(@PathParams('id') id: string, @QueryParams() query: Record<string, unknown>) {
    return this.reviewService.listForProvider(id, query);
  }

  @Put('/:id/verify')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async verify(@PathParams('id') id: string) {
    return this.serviceProviderService.verify(id);
  }

  @Put('/:id/suspend')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async suspend(@PathParams('id') id: string) {
    return this.serviceProviderService.suspend(id);
  }
}
