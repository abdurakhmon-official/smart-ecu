import { BadRequest, NotFound } from '@tsed/exceptions';

export class ServiceProviderNotFoundException extends NotFound {
  readonly _code = 'SERVICE_PROVIDER_NOT_FOUND';

  constructor(id: string) {
    super(`Service provider ${id} not found`);
  }
}

export class ServiceProviderAlreadyExistsException extends BadRequest {
  readonly _code = 'SERVICE_PROVIDER_ALREADY_EXISTS';

  constructor() {
    super('You already have a service provider profile');
  }
}

export class ServiceOfferingNotFoundException extends NotFound {
  readonly _code = 'SERVICE_OFFERING_NOT_FOUND';

  constructor(id: string) {
    super(`Service offering ${id} not found`);
  }
}
