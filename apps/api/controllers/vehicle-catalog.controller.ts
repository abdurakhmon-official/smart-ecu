import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Delete, Get, Post, Put } from '@tsed/schema';
import {
  CreateBrandInputSchema,
  UpdateBrandInputSchema,
  CreateModelInputSchema,
  UpdateModelInputSchema,
  CreateGenerationInputSchema,
  UpdateGenerationInputSchema,
  CreateEngineOptionInputSchema,
  UpdateEngineOptionInputSchema,
} from '@/inputs/vehicle-catalog.input';
import type {
  CreateBrandInput,
  UpdateBrandInput,
  CreateModelInput,
  UpdateModelInput,
  CreateGenerationInput,
  UpdateGenerationInput,
  CreateEngineOptionInput,
  UpdateEngineOptionInput,
} from '@/inputs/vehicle-catalog.input';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { VehicleCatalogService } from '@/services/vehicle-catalog.service';

@Controller('/vehicle-catalog')
export class VehicleCatalogController {
  @Inject()
  private catalogService!: VehicleCatalogService;

  // brand
  @Get('/brands')
  async listBrands() {
    return this.catalogService.listBrands();
  }

  @Post('/brands')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createBrand(@BodyParams() body: CreateBrandInput) {
    const data = CreateBrandInputSchema.parse(body);
    return this.catalogService.createBrand(data);
  }

  @Put('/brands/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateBrand(@PathParams('id') id: string, @BodyParams() body: UpdateBrandInput) {
    const data = UpdateBrandInputSchema.parse(body);
    return this.catalogService.updateBrand(id, data);
  }

  @Delete('/brands/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteBrand(@PathParams('id') id: string) {
    return this.catalogService.deleteBrand(id);
  }

  // model
  @Get('/brands/:brandId/models')
  async listModels(@PathParams('brandId') brandId: string) {
    return this.catalogService.listModels(brandId);
  }

  @Post('/models')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createModel(@BodyParams() body: CreateModelInput) {
    const data = CreateModelInputSchema.parse(body);
    return this.catalogService.createModel(data);
  }

  @Put('/models/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateModel(@PathParams('id') id: string, @BodyParams() body: UpdateModelInput) {
    const data = UpdateModelInputSchema.parse(body);
    return this.catalogService.updateModel(id, data);
  }

  @Delete('/models/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteModel(@PathParams('id') id: string) {
    return this.catalogService.deleteModel(id);
  }

  // generation
  @Get('/models/:modelId/generations')
  async listGenerations(@PathParams('modelId') modelId: string) {
    return this.catalogService.listGenerations(modelId);
  }

  @Post('/generations')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createGeneration(@BodyParams() body: CreateGenerationInput) {
    const data = CreateGenerationInputSchema.parse(body);
    return this.catalogService.createGeneration(data);
  }

  @Put('/generations/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateGeneration(@PathParams('id') id: string, @BodyParams() body: UpdateGenerationInput) {
    const data = UpdateGenerationInputSchema.parse(body);
    return this.catalogService.updateGeneration(id, data);
  }

  @Delete('/generations/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteGeneration(@PathParams('id') id: string) {
    return this.catalogService.deleteGeneration(id);
  }

  // engine option
  @Get('/generations/:generationId/engine-options')
  async listEngineOptions(@PathParams('generationId') generationId: string) {
    return this.catalogService.listEngineOptions(generationId);
  }

  @Post('/engine-options')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createEngineOption(@BodyParams() body: CreateEngineOptionInput) {
    const data = CreateEngineOptionInputSchema.parse(body);
    return this.catalogService.createEngineOption(data);
  }

  @Put('/engine-options/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateEngineOption(@PathParams('id') id: string, @BodyParams() body: UpdateEngineOptionInput) {
    const data = UpdateEngineOptionInputSchema.parse(body);
    return this.catalogService.updateEngineOption(id, data);
  }

  @Delete('/engine-options/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteEngineOption(@PathParams('id') id: string) {
    return this.catalogService.deleteEngineOption(id);
  }
}
