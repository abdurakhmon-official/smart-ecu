import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Put } from '@tsed/schema';
import { CreateOrderInputSchema } from '@/inputs/order.input';
import type { CreateOrderInput } from '@/inputs/order.input';
import { CreateReviewInputSchema } from '@/inputs/review.input';
import type { CreateReviewInput } from '@/inputs/review.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { MyOrdersService } from '@/services/my-orders.service';

@Controller('/my-orders')
export class MyOrdersController {
  @Inject()
  private myOrdersService!: MyOrdersService;

  @Get('/')
  @Authorized(Authenticate())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.myOrdersService.list(query);
  }

  @Post('/')
  @Authorized(Authenticate())
  async create(@BodyParams() body: CreateOrderInput) {
    const data = CreateOrderInputSchema.parse(body);
    return this.myOrdersService.create(data);
  }

  @Get('/:id')
  @Authorized(Authenticate())
  async get(@PathParams('id') id: string) {
    return this.myOrdersService.get(id);
  }

  @Put('/:id/cancel')
  @Authorized(Authenticate())
  async cancel(@PathParams('id') id: string) {
    return this.myOrdersService.cancel(id);
  }

  @Post('/:id/review')
  @Authorized(Authenticate())
  async review(@PathParams('id') id: string, @BodyParams() body: CreateReviewInput) {
    const data = CreateReviewInputSchema.parse(body);
    return this.myOrdersService.review(id, data);
  }
}
