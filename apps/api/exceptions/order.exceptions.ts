import { BadRequest, NotFound } from '@tsed/exceptions';

export class OrderNotFoundException extends NotFound {
  readonly _code = 'ORDER_NOT_FOUND';

  constructor(orderId: string) {
    super(`Order ${orderId} not found`);
  }
}

export class OrderNotAcceptableException extends BadRequest {
  readonly _code = 'ORDER_NOT_ACCEPTABLE';

  constructor() {
    super('This order is no longer available — it was already accepted, completed, or cancelled');
  }
}

export class OrderNotCancellableException extends BadRequest {
  readonly _code = 'ORDER_NOT_CANCELLABLE';

  constructor() {
    super('Only a new, unaccepted order can be cancelled');
  }
}

export class OrderNotYoursToCompleteException extends BadRequest {
  readonly _code = 'ORDER_NOT_YOURS_TO_COMPLETE';

  constructor() {
    super('Only the workshop that accepted this order can mark it completed');
  }
}
