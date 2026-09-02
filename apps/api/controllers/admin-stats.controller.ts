import { Controller, Inject } from '@tsed/di';
import { Get } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { AdminStatsService } from '@/services/admin-stats.service';

@Controller('/admin/stats')
export class AdminStatsController {
  @Inject()
  private adminStatsService!: AdminStatsService;

  @Get('/')
  @Authorized(AdminOnly())
  async get() {
    return this.adminStatsService.get();
  }
}
