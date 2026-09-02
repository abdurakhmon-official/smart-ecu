import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Get } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { ReviewService } from '@/services/review.service';

@Controller('/admin/reviews')
export class AdminReviewController {
  @Inject()
  private reviewService!: ReviewService;

  @Get('/')
  @Authorized(AdminOnly())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.reviewService.adminList(query);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async remove(@PathParams('id') id: string) {
    return this.reviewService.adminDelete(id);
  }
}
