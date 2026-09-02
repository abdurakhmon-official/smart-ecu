import { Controller, Inject } from '@tsed/di';
import { QueryParams } from '@tsed/platform-params';
import { Get } from '@tsed/schema';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { AuditLogService } from '@/services/audit-log.service';

@Controller('/admin/audit-log')
export class AuditLogController {
  @Inject()
  private auditLogService!: AuditLogService;

  @Get('/')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.auditLogService.list(query);
  }
}
