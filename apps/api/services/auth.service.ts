import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import type { SigninOutput } from '@repo/contracts';
import prisma from '@/modules/db';
import { comparePassword, createAccessToken, hashPassword, needsRehash } from '@/modules/auth';
import { clearLoginFailures, loginBlockedFor, LOGIN_GUARD, recordLoginFailure } from '@/utils/login-guard.utils';
import { TooManyRequests } from '@/middlewares/rate-limit.middleware';
import { TokenService } from '@/services/token.service';
import { MfaChallengeService } from '@/services/mfa-challenge.service';
import { TwoFactorService } from '@/services/two-factor.service';
import { USER_PUBLIC_SELECT } from '@/utils/constants';
import { USER_ROLE } from '../generated/prisma';
import type { SignupInput, SigninInput } from '@/inputs/auth.input';
import type { TwoFactorVerifyInput } from '@/inputs/two-factor.input';
import { AccountInactiveException, EmailAlreadyTakenException, InvalidCredentialsException } from '@/exceptions/auth.exceptions';
import { MfaChallengeInvalidException, TwoFactorInvalidCodeException } from '@/exceptions/two-factor.exceptions';
import { UserNotFoundException } from '@/exceptions/user.exceptions';

@Injectable()
export class AuthService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private tokenService!: TokenService;

  @Inject()
  private mfaChallengeService!: MfaChallengeService;

  @Inject()
  private twoFactorService!: TwoFactorService;

  private get request() {
    return this.context.getRequest<Request>();
  }

  private get user() {
    return this.request.user;
  }

  async signup(input: SignupInput) {
    const email = input.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new EmailAlreadyTakenException();

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email,
        password: await hashPassword(input.password),
        locale: input.locale,
        role: USER_ROLE.CUSTOMER,
      },
      select: USER_PUBLIC_SELECT,
    });

    return {
      success: true,
      _code: 'AUTH_SIGNED_UP',
      _message: 'Registered successfully',
      data: createAccessToken(user),
    };
  }

  async signin(input: SigninInput) {
    const email = input.email.toLowerCase();

    const blockedFor = await loginBlockedFor(email);
    if (blockedFor > 0) {
      throw new TooManyRequests(`too many failed attempts, try again in ${Math.ceil(blockedFor / 60)} minutes`, {
        retryAfter: blockedFor,
        limit: LOGIN_GUARD.MAX_FAILURES,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      await recordLoginFailure(email);
      throw new InvalidCredentialsException();
    }

    const isValid = await comparePassword(input.password, user.password);

    if (!isValid) {
      await recordLoginFailure(email);
      throw new InvalidCredentialsException();
    }

    if (!user.active) {
      throw new AccountInactiveException();
    }

    await clearLoginFailures(email);

    if (needsRehash(user.password)) {
      await this.rehashPassword(user.id, input.password);
    }

    if (user.twoFactorEnabledAt) {
      const mfaToken = await this.mfaChallengeService.create(user.id);
      return { success: true, data: { mfaRequired: true, mfaToken } satisfies SigninOutput };
    }

    return { success: true, data: { mfaRequired: false, ...createAccessToken(user) } satisfies SigninOutput };
  }

  async verifyTwoFactor(input: TwoFactorVerifyInput) {
    const userId = await this.mfaChallengeService.resolve(input.mfaToken);
    if (!userId) throw new MfaChallengeInvalidException();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt || !user.active) throw new MfaChallengeInvalidException();

    const valid = await this.twoFactorService.verifyCode(user, input.code);
    if (!valid) throw new TwoFactorInvalidCodeException();

    await this.mfaChallengeService.invalidate(input.mfaToken);

    return { success: true, data: { mfaRequired: false, ...createAccessToken(user) } satisfies SigninOutput };
  }

  async me() {
    const user = await prisma.user.findUnique({
      where: { id: this.user?.id },
      select: USER_PUBLIC_SELECT,
    });

    if (!user || user.deletedAt) throw new UserNotFoundException(this.user?.id ?? '');

    const { twoFactorEnabledAt, telegramChatId, ...rest } = user;

    return {
      success: true,
      data: {
        ...rest,
        isAdmin: user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.SUPER_ADMIN,
        twoFactorEnabled: twoFactorEnabledAt !== null,
        telegramLinked: telegramChatId !== null,
      },
    };
  }

  async logout() {
    const payload = this.request.auth;
    if (payload) await this.tokenService.revoke(payload);

    return { success: true, _code: 'AUTH_SIGNED_OUT', _message: 'Signed out' };
  }

  private async rehashPassword(userId: string, plainPassword: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: await hashPassword(plainPassword) },
      });
    } catch (error) {
      console.warn(`[auth] password rehash failed for ${userId}: ${(error as Error).message}`);
    }
  }
}
