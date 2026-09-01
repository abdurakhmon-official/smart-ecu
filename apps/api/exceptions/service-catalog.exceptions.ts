import { NotFound } from '@tsed/exceptions';

export class ServiceCatalogItemNotFoundException extends NotFound {
  readonly _code = 'SERVICE_CATALOG_ITEM_NOT_FOUND';

  constructor(itemId: string) {
    super(`Service catalog item ${itemId} not found`);
  }
}
