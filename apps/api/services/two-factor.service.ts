import { InjectContext, Injectable, Inject } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { comparePassword, hashPassword } from '@/modules/auth';
import { buildOtpauthUrl, generateBackupCodes, generateQrCodeDataUrl, generateTotpSecret, verifyTotpCode } from '@/modules/two-factor';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import type { TwoFactorCodeInput } from '@/inputs/two-factor.input';
import {
  TwoFactorAlreadyEnabledException,
  TwoFactorInvalidCodeException,
  TwoFactorNotEnabledException,
  TwoFactorSetupRequiredException,
} from '@/exceptions/two-factor.exceptions';
import { UserNotFoundException } from '@/exceptions/user.exceptions';
import { AuditLogService } from '@/services/audit-log.service';

// types

interface TwoFactorCapableUser {
  id: string;
  email: string;
  twoFactorSecret: string | null;
}

@Injectable()
export class TwoFactorService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private auditLogService!: AuditLogService;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  /** Yangi maxfiy kalit generatsiya qilib saqlaydi — `enable()` bilan tasdiqlanmaguncha 2FA hali faol emas. */
  async setup() {
    const userId = this.currentUserId;
    const user = await this.getUserOrThrow(userId);

    const secret = generateTotpSecret();
    await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

    const otpauthUrl = buildOtpauthUrl(user.email, secret);
    const qrCodeDataUrl = await generateQrCodeDataUrl(user.email, secret);

    return ok({ secret, otpauthUrl, qrCodeDataUrl });
  }

  async enable({ code }: TwoFactorCodeInput) {
    const userId = this.currentUserId;
    const user = await this.getUserOrThrow(userId);

    if (user.twoFactorEnabledAt) throw new TwoFactorAlreadyEnabledException();
    if (!user.twoFactorSecret) throw new TwoFactorSetupRequiredException();
    if (!verifyTotpCode(user.email, user.twoFactorSecret, code)) throw new TwoFactorInvalidCodeException();

    const backupCodes = generateBackupCodes();
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { twoFactorEnabledAt: new Date() } }),
      prisma.twoFactorBackupCode.deleteMany({ where: { userId } }),
      prisma.twoFactorBackupCode.createMany({
        data: await Promise.all(
          backupCodes.map(async (plain) => ({ userId, codeHash: await hashPassword(plain) })),
        ),
      }),
    ]);

    await this.auditLogService.record({ actorId: userId, action: 'TWO_FACTOR_ENABLED', targetType: 'User', targetId: userId });

    return ok({ backupCodes });
  }

  async disable({ code }: TwoFactorCodeInput) {
    const userId = this.currentUserId;
    const user = await this.getUserOrThrow(userId);

    if (!user.twoFactorEnabledAt) throw new TwoFactorNotEnabledException();
    if (!(await this.verifyCode(user, code))) throw new TwoFactorInvalidCodeException();

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: null, twoFactorEnabledAt: null } }),
      prisma.twoFactorBackupCode.deleteMany({ where: { userId } }),
    ]);

    await this.auditLogService.record({ actorId: userId, action: 'TWO_FACTOR_DISABLED', targetType: 'User', targetId: userId });

    return ok(null);
  }

  /** Login oqimida ham (`AuthService.verifyTwoFactor`), `disable()`da ham ishlatiladi — TOTP yoki bitta zaxira kod. */
  async verifyCode(user: TwoFactorCapableUser, code: string): Promise<boolean> {
    if (!user.twoFactorSecret) return false;
    if (verifyTotpCode(user.email, user.twoFactorSecret, code)) return true;

    return this.consumeBackupCode(user.id, code);
  }

  private async consumeBackupCode(userId: string, code: string): Promise<boolean> {
    const normalized = code.trim().toUpperCase();
    const candidates = await prisma.twoFactorBackupCode.findMany({ where: { userId, usedAt: null } });

    for (const candidate of candidates) {
      if (await comparePassword(normalized, candidate.codeHash)) {
        await prisma.twoFactorBackupCode.update({ where: { id: candidate.id }, data: { usedAt: new Date() } });
        return true;
      }
    }

    return false;
  }

  private async getUserOrThrow(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new UserNotFoundException(userId);
    return user;
  }
}
