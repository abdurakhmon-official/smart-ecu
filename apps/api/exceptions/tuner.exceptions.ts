import { BadRequest, NotFound } from '@tsed/exceptions';

export class TunerProfileNotFoundException extends NotFound {
  readonly _code = 'TUNER_PROFILE_NOT_FOUND';

  constructor(id: string) {
    super(`Tuner profile ${id} not found`);
  }
}

export class TunerProfileAlreadyExistsException extends BadRequest {
  readonly _code = 'TUNER_PROFILE_ALREADY_EXISTS';

  constructor() {
    super('You already have a tuner profile');
  }
}
