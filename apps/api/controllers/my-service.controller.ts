import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Delete, Get, Post, Put } from '@tsed/schema';
import { CreateServiceProviderInputSchema, UpdateServiceProviderInputSchema } from '@/inputs/service-provider.input';
import type { CreateServiceProviderInput, UpdateServiceProviderInput } from '@/inputs/service-provider.input';
import { CreateServiceOfferingInputSchema, UpdateServiceOfferingInputSchema } from '@/inputs/service-offering.input';
import type { CreateServiceOfferingInput, UpdateServiceOfferingInput } from '@/inputs/service-offering.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { MyServiceService } from '@/services/my-service.service';

@Controller('/my-service')
export class MyServiceController {
  @Inject()
  private myServiceService!: MyServiceService;

  @Get('/')
  @Authorized(Authenticate())
  async getMine() {
    return this.myServiceService.getMine();
  }

  @Post('/')
  @Authorized(Authenticate())
  async apply(@BodyParams() body: CreateServiceProviderInput) {
    const data = CreateServiceProviderInputSchema.parse(body);
    return this.myServiceService.apply(data);
  }

  @Put('/')
  @Authorized(Authenticate())
  async update(@BodyParams() body: UpdateServiceProviderInput) {
    const data = UpdateServiceProviderInputSchema.parse(body);
    return this.myServiceService.update(data);
  }

  @Post('/offerings')
  @Authorized(Authenticate())
  async addOffering(@BodyParams() body: CreateServiceOfferingInput) {
    const data = CreateServiceOfferingInputSchema.parse(body);
    return this.myServiceService.addOffering(data);
  }

  @Put('/offerings/:id')
  @Authorized(Authenticate())
  async updateOffering(@PathParams('id') id: string, @BodyParams() body: UpdateServiceOfferingInput) {
    const data = UpdateServiceOfferingInputSchema.parse(body);
    return this.myServiceService.updateOffering(id, data);
  }

  @Delete('/offerings/:id')
  @Authorized(Authenticate())
  async removeOffering(@PathParams('id') id: string) {
    return this.myServiceService.removeOffering(id);
  }
}
