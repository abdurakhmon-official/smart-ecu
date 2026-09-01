import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { ok } from '@/utils/response.utils';
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
import {
  BrandNotFoundException,
  ModelNotFoundException,
  GenerationNotFoundException,
  EngineOptionNotFoundException,
} from '@/exceptions/vehicle-catalog.exceptions';

@Injectable()
export class VehicleCatalogService {
  // ── Brand ──────────────────────────────────────────────────────────────

  async listBrands() {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return ok(brands.map(VehicleCatalogService.serializeBrand));
  }

  async createBrand(input: CreateBrandInput) {
    const brand = await prisma.brand.create({ data: input });
    return ok(VehicleCatalogService.serializeBrand(brand));
  }

  async updateBrand(brandId: string, input: UpdateBrandInput) {
    await this.getBrandOrThrow(brandId);
    const brand = await prisma.brand.update({ where: { id: brandId }, data: input });
    return ok(VehicleCatalogService.serializeBrand(brand));
  }

  async deleteBrand(brandId: string) {
    await this.getBrandOrThrow(brandId);
    await prisma.brand.delete({ where: { id: brandId } });
    return ok(null);
  }

  // ── Model ──────────────────────────────────────────────────────────────

  async listModels(brandId: string) {
    await this.getBrandOrThrow(brandId);
    const models = await prisma.model.findMany({ where: { brandId }, orderBy: { name: 'asc' } });
    return ok(models.map(VehicleCatalogService.serializeModel));
  }

  async createModel(input: CreateModelInput) {
    await this.getBrandOrThrow(input.brandId);
    const model = await prisma.model.create({ data: input });
    return ok(VehicleCatalogService.serializeModel(model));
  }

  async updateModel(modelId: string, input: UpdateModelInput) {
    await this.getModelOrThrow(modelId);
    const model = await prisma.model.update({ where: { id: modelId }, data: input });
    return ok(VehicleCatalogService.serializeModel(model));
  }

  async deleteModel(modelId: string) {
    await this.getModelOrThrow(modelId);
    await prisma.model.delete({ where: { id: modelId } });
    return ok(null);
  }

  // ── Generation ─────────────────────────────────────────────────────────

  async listGenerations(modelId: string) {
    await this.getModelOrThrow(modelId);
    const generations = await prisma.generation.findMany({ where: { modelId }, orderBy: { yearFrom: 'desc' } });
    return ok(generations.map(VehicleCatalogService.serializeGeneration));
  }

  async createGeneration(input: CreateGenerationInput) {
    await this.getModelOrThrow(input.modelId);
    const generation = await prisma.generation.create({ data: input });
    return ok(VehicleCatalogService.serializeGeneration(generation));
  }

  async updateGeneration(generationId: string, input: UpdateGenerationInput) {
    await this.getGenerationOrThrow(generationId);
    const generation = await prisma.generation.update({ where: { id: generationId }, data: input });
    return ok(VehicleCatalogService.serializeGeneration(generation));
  }

  async deleteGeneration(generationId: string) {
    await this.getGenerationOrThrow(generationId);
    await prisma.generation.delete({ where: { id: generationId } });
    return ok(null);
  }

  // ── Engine option ──────────────────────────────────────────────────────

  async listEngineOptions(generationId: string) {
    await this.getGenerationOrThrow(generationId);
    const engines = await prisma.engineOption.findMany({ where: { generationId }, orderBy: { name: 'asc' } });
    return ok(engines.map(VehicleCatalogService.serializeEngineOption));
  }

  async createEngineOption(input: CreateEngineOptionInput) {
    await this.getGenerationOrThrow(input.generationId);
    const engine = await prisma.engineOption.create({ data: input });
    return ok(VehicleCatalogService.serializeEngineOption(engine));
  }

  async updateEngineOption(engineOptionId: string, input: UpdateEngineOptionInput) {
    await this.getEngineOptionOrThrow(engineOptionId);
    const engine = await prisma.engineOption.update({ where: { id: engineOptionId }, data: input });
    return ok(VehicleCatalogService.serializeEngineOption(engine));
  }

  async deleteEngineOption(engineOptionId: string) {
    await this.getEngineOptionOrThrow(engineOptionId);
    await prisma.engineOption.delete({ where: { id: engineOptionId } });
    return ok(null);
  }

  // ── lookups ────────────────────────────────────────────────────────────

  private async getBrandOrThrow(brandId: string) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new BrandNotFoundException(brandId);
    return brand;
  }

  private async getModelOrThrow(modelId: string) {
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) throw new ModelNotFoundException(modelId);
    return model;
  }

  private async getGenerationOrThrow(generationId: string) {
    const generation = await prisma.generation.findUnique({ where: { id: generationId } });
    if (!generation) throw new GenerationNotFoundException(generationId);
    return generation;
  }

  private async getEngineOptionOrThrow(engineOptionId: string) {
    const engine = await prisma.engineOption.findUnique({ where: { id: engineOptionId } });
    if (!engine) throw new EngineOptionNotFoundException(engineOptionId);
    return engine;
  }

  // ── serializers ────────────────────────────────────────────────────────

  private static serializeBrand<T extends { createdAt: Date }>(brand: T) {
    return { ...brand, createdAt: brand.createdAt.toISOString() };
  }

  private static serializeModel<T extends { createdAt: Date }>(model: T) {
    return { ...model, createdAt: model.createdAt.toISOString() };
  }

  private static serializeGeneration<T extends { createdAt: Date }>(generation: T) {
    return { ...generation, createdAt: generation.createdAt.toISOString() };
  }

  private static serializeEngineOption<T extends { createdAt: Date }>(engine: T) {
    return { ...engine, createdAt: engine.createdAt.toISOString() };
  }
}
