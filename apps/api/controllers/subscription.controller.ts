import { Controller, Inject } from '@tsed/di';
import { BodyParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { InitiatePaymentInputSchema } from '@/inputs/subscription.input';
import type { InitiatePaymentInput } from '@/inputs/subscription.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { SubscriptionService } from '@/services/subscription.service';

@Controller('/my-subscription')
export class SubscriptionController {
  @Inject()
  private subscriptionService!: SubscriptionService;

  @Get('/plans')
  async plans() {
    return this.subscriptionService.plans();
  }

  @Get('/')
  @Authorized(Authenticate())
  async getMine() {
    return this.subscriptionService.getMine();
  }

  @Get('/payments')
  @Authorized(Authenticate())
  async myPayments() {
    return this.subscriptionService.myPayments();
  }

  @Post('/checkout')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async initiatePayment(@BodyParams() body: InitiatePaymentInput) {
    const data = InitiatePaymentInputSchema.parse(body);
    return this.subscriptionService.initiatePayment(data);
  }
}
