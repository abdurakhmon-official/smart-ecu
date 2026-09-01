import { ServiceUnavailable } from '@tsed/exceptions';

export class AiAssistantNotConfiguredException extends ServiceUnavailable {
  readonly _code = 'AI_ASSISTANT_NOT_CONFIGURED';

  constructor() {
    super('AI assistant is not configured');
  }
}

export class AiAssistantUpstreamException extends ServiceUnavailable {
  readonly _code = 'AI_ASSISTANT_UPSTREAM_ERROR';

  constructor() {
    super('AI assistant upstream request failed');
  }
}
