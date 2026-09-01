import type {
  BrandOutput,
  CreateBrandInput,
  UpdateBrandInput,
  ModelOutput,
  CreateModelInput,
  UpdateModelInput,
  GenerationOutput,
  CreateGenerationInput,
  UpdateGenerationInput,
  EngineOptionOutput,
  CreateEngineOptionInput,
  UpdateEngineOptionInput,
} from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class VehicleCatalogService extends BaseService<never, never, never> {
  protected BASE_PATH = 'vehicle-catalog';

  // ── Brand ──────────────────────────────────────────────────────────────

  async listBrands() {
    return this.sendGet<BrandOutput[]>('/brands');
  }

  async createBrand(input: CreateBrandInput) {
    return this.sendPost<BrandOutput, CreateBrandInput>('/brands', input);
  }

  async updateBrand(brandId: string, input: UpdateBrandInput) {
    return this.sendPut<BrandOutput, UpdateBrandInput>(`/brands/${brandId}`, input);
  }

  async deleteBrand(brandId: string) {
    return this.sendDelete(`/brands/${brandId}`);
  }

  // ── Model ──────────────────────────────────────────────────────────────

  async listModels(brandId: string) {
    return this.sendGet<ModelOutput[]>(`/brands/${brandId}/models`);
  }

  async createModel(input: CreateModelInput) {
    return this.sendPost<ModelOutput, CreateModelInput>('/models', input);
  }

  async updateModel(modelId: string, input: UpdateModelInput) {
    return this.sendPut<ModelOutput, UpdateModelInput>(`/models/${modelId}`, input);
  }

  async deleteModel(modelId: string) {
    return this.sendDelete(`/models/${modelId}`);
  }

  // ── Generation ─────────────────────────────────────────────────────────

  async listGenerations(modelId: string) {
    return this.sendGet<GenerationOutput[]>(`/models/${modelId}/generations`);
  }

  async createGeneration(input: CreateGenerationInput) {
    return this.sendPost<GenerationOutput, CreateGenerationInput>('/generations', input);
  }

  async updateGeneration(generationId: string, input: UpdateGenerationInput) {
    return this.sendPut<GenerationOutput, UpdateGenerationInput>(`/generations/${generationId}`, input);
  }

  async deleteGeneration(generationId: string) {
    return this.sendDelete(`/generations/${generationId}`);
  }

  // ── Engine option ──────────────────────────────────────────────────────

  async listEngineOptions(generationId: string) {
    return this.sendGet<EngineOptionOutput[]>(`/generations/${generationId}/engine-options`);
  }

  async createEngineOption(input: CreateEngineOptionInput) {
    return this.sendPost<EngineOptionOutput, CreateEngineOptionInput>('/engine-options', input);
  }

  async updateEngineOption(engineOptionId: string, input: UpdateEngineOptionInput) {
    return this.sendPut<EngineOptionOutput, UpdateEngineOptionInput>(`/engine-options/${engineOptionId}`, input);
  }

  async deleteEngineOption(engineOptionId: string) {
    return this.sendDelete(`/engine-options/${engineOptionId}`);
  }
}

export const vehicleCatalogService = new VehicleCatalogService();
