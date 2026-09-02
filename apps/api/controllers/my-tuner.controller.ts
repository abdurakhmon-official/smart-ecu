import { Controller, Inject } from '@tsed/di';
import { BodyParams } from '@tsed/platform-params';
import { Get, Post, Put } from '@tsed/schema';
import { CreateTunerProfileInputSchema, UpdateTunerProfileInputSchema } from '@/inputs/tuner-profile.input';
import type { CreateTunerProfileInput, UpdateTunerProfileInput } from '@/inputs/tuner-profile.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { MyTunerService } from '@/services/my-tuner.service';

@Controller('/my-tuner')
export class MyTunerController {
  @Inject()
  private myTunerService!: MyTunerService;

  @Get('/')
  @Authorized(Authenticate())
  async getMine() {
    return this.myTunerService.getMine();
  }

  @Post('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async apply(@BodyParams() body: CreateTunerProfileInput) {
    const data = CreateTunerProfileInputSchema.parse(body);
    return this.myTunerService.apply(data);
  }

  @Put('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async update(@BodyParams() body: UpdateTunerProfileInput) {
    const data = UpdateTunerProfileInputSchema.parse(body);
    return this.myTunerService.update(data);
  }
}
