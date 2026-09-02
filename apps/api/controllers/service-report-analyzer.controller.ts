import { Controller, Inject } from '@tsed/di';
import { BodyParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { AnalyzeReportInputSchema } from '@/inputs/service-report-analysis.input';
import type { AnalyzeReportInput } from '@/inputs/service-report-analysis.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { ServiceReportAnalyzerService } from '@/services/service-report-analyzer.service';

@Controller('/service-report-analyzer')
export class ServiceReportAnalyzerController {
  @Inject()
  private serviceReportAnalyzerService!: ServiceReportAnalyzerService;

  @Get('/')
  @Authorized(Authenticate())
  async list() {
    return this.serviceReportAnalyzerService.list();
  }

  @Post('/analyze')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.ai)
  async analyze(@BodyParams() body: AnalyzeReportInput) {
    const data = AnalyzeReportInputSchema.parse(body);
    return this.serviceReportAnalyzerService.analyze(data);
  }
}
