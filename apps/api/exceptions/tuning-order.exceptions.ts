import { BadRequest, NotFound } from '@tsed/exceptions';

export class TuningOrderNotFoundException extends NotFound {
  readonly _code = 'TUNING_ORDER_NOT_FOUND';

  constructor(id: string) {
    super(`Tuning order ${id} not found`);
  }
}

export class InvalidTuningOrderStatusException extends BadRequest {
  readonly _code = 'INVALID_TUNING_ORDER_STATUS';

  constructor() {
    super('This status transition is not allowed');
  }
}

export class TuningOrderCancelledException extends BadRequest {
  readonly _code = 'TUNING_ORDER_CANCELLED';

  constructor() {
    super('This tuning order was cancelled');
  }
}

export class TuningOrderNotCancellableException extends BadRequest {
  readonly _code = 'TUNING_ORDER_NOT_CANCELLABLE';

  constructor() {
    super('Only a new, unstarted tuning order can be cancelled');
  }
}

export class EcuFileKindNotAllowedException extends BadRequest {
  readonly _code = 'ECU_FILE_KIND_NOT_ALLOWED';

  constructor() {
    super('This file kind is not allowed for this action');
  }
}
