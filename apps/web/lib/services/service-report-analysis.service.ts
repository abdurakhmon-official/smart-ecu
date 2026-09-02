import type { AnalyzeReportInput, ServiceReportAnalysisOutput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class ServiceReportAnalysisService extends BaseService<ServiceReportAnalysisOutput, never, never> {
  protected BASE_PATH = 'service-report-analyzer';

  async list(): Promise<ServiceReportAnalysisOutput[]> {
    return this.sendGet<ServiceReportAnalysisOutput[]>('');
  }

  async analyze(input: AnalyzeReportInput): Promise<ServiceReportAnalysisOutput> {
    return this.sendPost<ServiceReportAnalysisOutput, AnalyzeReportInput>('/analyze', input);
  }
}

export const serviceReportAnalysisService = new ServiceReportAnalysisService();
