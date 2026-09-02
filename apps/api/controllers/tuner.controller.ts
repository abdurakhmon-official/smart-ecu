import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Put } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { TunerService } from '@/services/tuner.service';

/**
 * O'qish — hamma uchun ochiq, lekin faqat `VERIFIED` tunerlar ko'rinadi.
 * Moderatsiya — ADMIN. `/admin` — `/:id`dan OLDIN e'lon qilinadi (`ServiceProviderController`dagi
 * bilan bir xil sabab: aks holda `admin` `:id` sifatida talqin qilinadi).
 */
@Controller('/tuners')
export class TunerController {
  @Inject()
  private tunerService!: TunerService;

  @Get('/')
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.tunerService.list(query);
  }

  @Get('/admin')
  @Authorized(AdminOnly())
  async adminList(@QueryParams() query: Record<string, unknown>) {
    return this.tunerService.adminList(query);
  }

  @Get('/:id')
  async getById(@PathParams('id') id: string) {
    return this.tunerService.getById(id);
  }

  @Put('/:id/verify')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async verify(@PathParams('id') id: string) {
    return this.tunerService.verify(id);
  }

  @Put('/:id/suspend')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async suspend(@PathParams('id') id: string) {
    return this.tunerService.suspend(id);
  }
}
