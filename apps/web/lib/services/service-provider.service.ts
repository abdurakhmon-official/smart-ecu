import type { ServiceProviderOutput, ServiceProviderQuery, AdminServiceProviderQuery } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class ServiceProviderService extends BaseService<ServiceProviderOutput, never, never> {
  protected BASE_PATH = 'service-providers';

  async list(query: Partial<ServiceProviderQuery> = {}): Promise<Paged<ServiceProviderOutput>> {
    return this.sendGetPaged<ServiceProviderOutput>('', query);
  }

  async adminList(query: Partial<AdminServiceProviderQuery> = {}): Promise<Paged<ServiceProviderOutput>> {
    return this.sendGetPaged<ServiceProviderOutput>('/admin', query);
  }

  async verify(id: string) {
    return this.sendPut<ServiceProviderOutput>(`/${id}/verify`, {});
  }

  async suspend(id: string) {
    return this.sendPut<ServiceProviderOutput>(`/${id}/suspend`, {});
  }
}

export const serviceProviderService = new ServiceProviderService();
