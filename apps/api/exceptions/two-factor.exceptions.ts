import { BadRequest, Unauthorized } from '@tsed/exceptions';

export class TwoFactorSetupRequiredException extends BadRequest {
  readonly _code = 'TWO_FACTOR_SETUP_REQUIRED';

  constructor() {
    super('Start 2FA setup before enabling it');
  }
}

export class TwoFactorAlreadyEnabledException extends BadRequest {
  readonly _code = 'TWO_FACTOR_ALREADY_ENABLED';

  constructor() {
    super('Two-factor authentication is already enabled');
  }
}

export class TwoFactorNotEnabledException extends BadRequest {
  readonly _code = 'TWO_FACTOR_NOT_ENABLED';

  constructor() {
    super('Two-factor authentication is not enabled');
  }
}

export class TwoFactorInvalidCodeException extends BadRequest {
  readonly _code = 'TWO_FACTOR_INVALID_CODE';

  constructor() {
    super('Invalid or expired code');
  }
}

export class MfaChallengeInvalidException extends Unauthorized {
  readonly _code = 'MFA_CHALLENGE_INVALID';

  constructor() {
    super('This sign-in challenge has expired, please sign in again');
  }
}
