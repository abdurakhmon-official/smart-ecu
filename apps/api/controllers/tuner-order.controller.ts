import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Put } from '@tsed/schema';
import { CreateEcuFileInputSchema } from '@/inputs/ecu-file.input';
import type { CreateEcuFileInput } from '@/inputs/ecu-file.input';
import { SetTuningResultsInputSchema, UpdateTuningOrderStatusInputSchema } from '@/inputs/tuning-order.input';
import type { SetTuningResultsInput, UpdateTuningOrderStatusInput } from '@/inputs/tuning-order.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { TunerOrderService } from '@/services/tuner-order.service';

@Controller('/my-tuner/orders')
export class TunerOrderController {
  @Inject()
  private tunerOrderService!: TunerOrderService;

  @Get('/')
  @Authorized(Authenticate())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.tunerOrderService.list(query);
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return this.tunerOrderService.get(id);
  }

  @Put('/:id/status')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async updateStatus(@PathParams('id') id: string, @BodyParams() body: UpdateTuningOrderStatusInput) {
    const data = UpdateTuningOrderStatusInputSchema.parse(body);
    return this.tunerOrderService.updateStatus(id, data);
  }

  @Put('/:id/results')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async setResults(@PathParams('id') id: string, @BodyParams() body: SetTuningResultsInput) {
    const data = SetTuningResultsInputSchema.parse(body);
    return this.tunerOrderService.setResults(id, data);
  }

  @Post('/:id/files')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async uploadFile(@PathParams('id') id: string, @BodyParams() body: CreateEcuFileInput) {
    const data = CreateEcuFileInputSchema.parse(body);
    return this.tunerOrderService.uploadFile(id, data);
  }
}
