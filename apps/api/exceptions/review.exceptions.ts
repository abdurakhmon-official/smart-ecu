import { BadRequest } from '@tsed/exceptions';

export class OrderNotCompletedException extends BadRequest {
  readonly _code = 'ORDER_NOT_COMPLETED';

  constructor() {
    super('You can only review an order once the workshop has completed it');
  }
}

export class ReviewAlreadyExistsException extends BadRequest {
  readonly _code = 'REVIEW_ALREADY_EXISTS';

  constructor() {
    super('This order has already been reviewed');
  }
}
