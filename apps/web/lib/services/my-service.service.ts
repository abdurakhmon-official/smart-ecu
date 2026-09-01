import type {
  ServiceProviderOutput,
  CreateServiceProviderInput,
  UpdateServiceProviderInput,
  ServiceOfferingOutput,
  CreateServiceOfferingInput,
  UpdateServiceOfferingInput,
} from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class MyServiceService extends BaseService<ServiceProviderOutput, CreateServiceProviderInput, UpdateServiceProviderInput> {
  protected BASE_PATH = 'my-service';

  async getMine() {
    return this.sendGet<ServiceProviderOutput | null>('');
  }

  async apply(input: CreateServiceProviderInput) {
    return this.sendPost<ServiceProviderOutput, CreateServiceProviderInput>('', input);
  }

  async updateMine(input: UpdateServiceProviderInput) {
    return this.sendPut<ServiceProviderOutput, UpdateServiceProviderInput>('', input);
  }

  async addOffering(input: CreateServiceOfferingInput) {
    return this.sendPost<ServiceOfferingOutput, CreateServiceOfferingInput>('/offerings', input);
  }

  async updateOffering(offeringId: string, input: UpdateServiceOfferingInput) {
    return this.sendPut<ServiceOfferingOutput, UpdateServiceOfferingInput>(`/offerings/${offeringId}`, input);
  }

  async removeOffering(offeringId: string) {
    return this.sendDelete(`/offerings/${offeringId}`);
  }
}

export const myServiceService = new MyServiceService();
