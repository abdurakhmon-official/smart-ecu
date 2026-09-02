import { Controller, Inject } from '@tsed/di';
import { BodyParams } from '@tsed/platform-params';
import { Delete, Get, Post } from '@tsed/schema';
import { SigninInputSchema, SignupInputSchema } from '@/inputs/auth.input';
import type { SigninInput, SignupInput } from '@/inputs/auth.input';
import { TwoFactorCodeInputSchema, TwoFactorVerifyInputSchema } from '@/inputs/two-factor.input';
import type { TwoFactorCodeInput, TwoFactorVerifyInput } from '@/inputs/two-factor.input';
import { AdminOnly, Authorized, Authenticate } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { AuthService } from '@/services/auth.service';
import { TwoFactorService } from '@/services/two-factor.service';

@Controller('/auth')
export class AuthController {
  @Inject()
  private authService!: AuthService;

  @Inject()
  private twoFactorService!: TwoFactorService;

  @Post('/signup')
  @RateLimit(RATE_LIMITS.auth)
  async signup(@BodyParams() body: SignupInput) {
    const data = SignupInputSchema.parse(body);
    return this.authService.signup(data);
  }

  @Post('/signin')
  @RateLimit(RATE_LIMITS.auth)
  async signin(@BodyParams() body: SigninInput) {
    const data = SigninInputSchema.parse(body);
    return this.authService.signin(data);
  }

  @Post('/2fa/verify')
  @RateLimit(RATE_LIMITS.auth)
  async verifyTwoFactor(@BodyParams() body: TwoFactorVerifyInput) {
    const data = TwoFactorVerifyInputSchema.parse(body);
    return this.authService.verifyTwoFactor(data);
  }

  @Get('/me')
  @Authorized(Authenticate())
  async me() {
    return this.authService.me();
  }

  @Post('/logout')
  @Authorized(Authenticate())
  async logout() {
    return this.authService.logout();
  }

  @Post('/2fa/setup')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.auth)
  async setupTwoFactor() {
    return this.twoFactorService.setup();
  }

  @Post('/2fa/enable')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.auth)
  async enableTwoFactor(@BodyParams() body: TwoFactorCodeInput) {
    const data = TwoFactorCodeInputSchema.parse(body);
    return this.twoFactorService.enable(data);
  }

  @Delete('/2fa')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.auth)
  async disableTwoFactor(@BodyParams() body: TwoFactorCodeInput) {
    const data = TwoFactorCodeInputSchema.parse(body);
    return this.twoFactorService.disable(data);
  }
}
