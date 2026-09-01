import type {
  ServiceCatalogItemOutput,
  CreateServiceCatalogItemInput,
  UpdateServiceCatalogItemInput,
} from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class ServiceCatalogService extends BaseService<ServiceCatalogItemOutput, CreateServiceCatalogItemInput, UpdateServiceCatalogItemInput> {
  protected BASE_PATH = 'service-catalog';

  async list() {
    return this.sendGet<ServiceCatalogItemOutput[]>('');
  }
}

export const serviceCatalogService = new ServiceCatalogService();
