import type { AdminAuditLogQuery, AuditLogOutput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class AuditLogService extends BaseService<AuditLogOutput, never, never> {
  protected BASE_PATH = 'admin/audit-log';

  async list(query: Partial<AdminAuditLogQuery> = {}): Promise<Paged<AuditLogOutput>> {
    return this.sendGetPaged<AuditLogOutput>('', query);
  }
}

export const auditLogService = new AuditLogService();
