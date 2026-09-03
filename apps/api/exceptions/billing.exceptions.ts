import { BadRequest, NotFound, Unauthorized } from '@tsed/exceptions';

export class PaymentNotFoundException extends NotFound {
  readonly _code = 'PAYMENT_NOT_FOUND';

  constructor(id: string) {
    super(`Payment ${id} not found`);
  }
}

export class PaymentProviderNotConfiguredException extends BadRequest {
  readonly _code = 'PAYMENT_PROVIDER_NOT_CONFIGURED';

  constructor(provider: string) {
    super(`${provider} is not configured on the server`);
  }
}

export class InvalidPaymentSignatureException extends Unauthorized {
  readonly _code = 'INVALID_PAYMENT_SIGNATURE';

  constructor() {
    super('Invalid payment webhook signature');
  }
}
