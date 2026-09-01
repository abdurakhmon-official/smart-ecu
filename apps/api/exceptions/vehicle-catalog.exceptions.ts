import { NotFound } from '@tsed/exceptions';

export class BrandNotFoundException extends NotFound {
  readonly _code = 'VEHICLE_CATALOG_BRAND_NOT_FOUND';

  constructor(brandId: string) {
    super(`Brand ${brandId} not found`);
  }
}

export class ModelNotFoundException extends NotFound {
  readonly _code = 'VEHICLE_CATALOG_MODEL_NOT_FOUND';

  constructor(modelId: string) {
    super(`Model ${modelId} not found`);
  }
}

export class GenerationNotFoundException extends NotFound {
  readonly _code = 'VEHICLE_CATALOG_GENERATION_NOT_FOUND';

  constructor(generationId: string) {
    super(`Generation ${generationId} not found`);
  }
}

export class EngineOptionNotFoundException extends NotFound {
  readonly _code = 'VEHICLE_CATALOG_ENGINE_OPTION_NOT_FOUND';

  constructor(engineOptionId: string) {
    super(`Engine option ${engineOptionId} not found`);
  }
}
