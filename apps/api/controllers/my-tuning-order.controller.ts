import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Put } from '@tsed/schema';
import { CreateEcuFileInputSchema } from '@/inputs/ecu-file.input';
import type { CreateEcuFileInput } from '@/inputs/ecu-file.input';
import { CreateTuningOrderInputSchema } from '@/inputs/tuning-order.input';
import type { CreateTuningOrderInput } from '@/inputs/tuning-order.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { MyTuningOrderService } from '@/services/my-tuning-order.service';

@Controller('/my-tuning-orders')
export class MyTuningOrderController {
  @Inject()
  private myTuningOrderService!: MyTuningOrderService;

  @Get('/')
  @Authorized(Authenticate())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.myTuningOrderService.list(query);
  }

  @Post('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async create(@BodyParams() body: CreateTuningOrderInput) {
    const data = CreateTuningOrderInputSchema.parse(body);
    return this.myTuningOrderService.create(data);
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return this.myTuningOrderService.get(id);
  }

  @Put('/:id/cancel')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async cancel(@PathParams('id') id: string) {
    return this.myTuningOrderService.cancel(id);
  }

  @Post('/:id/files')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async uploadFile(@PathParams('id') id: string, @BodyParams() body: CreateEcuFileInput) {
    const data = CreateEcuFileInputSchema.parse(body);
    return this.myTuningOrderService.uploadFile(id, data);
  }
}
