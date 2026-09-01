import type { Response } from 'express';
import { Res } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { BodyParams } from '@tsed/platform-params';
import { Delete, Get, Post } from '@tsed/schema';
import type { SendAiMessageInput } from '@/inputs/ai-assistant.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { AiAssistantService } from '@/services/ai-assistant.service';

@Controller('/ai-assistant')
export class AiAssistantController {
  @Inject()
  private aiAssistantService!: AiAssistantService;

  @Get('/messages')
  @Authorized(Authenticate())
  async history() {
    return this.aiAssistantService.history();
  }

  @Delete('/messages')
  @Authorized(Authenticate())
  async reset() {
    return this.aiAssistantService.reset();
  }

  @Post('/messages')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.ai)
  async sendMessage(@BodyParams() body: SendAiMessageInput, @Res() res: Response) {
    await this.aiAssistantService.streamReply(body, res);
  }
}
