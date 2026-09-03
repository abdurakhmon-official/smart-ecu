import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { Prisma } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { AdminAuditLogQuerySchema } from '@/inputs/audit-log.input';

// types

interface RecordAuditLogParams {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  private static readonly INCLUDE = { actor: { select: { fullName: true, email: true } } } as const;

  async record(params: RecordAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          metadata: params.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      console.warn(`[audit-log] failed to record ${params.action}: ${(error as Error).message}`);
    }
  }

  async list(rawQuery: unknown) {
    const { page, size, action, targetType } = AdminAuditLogQuerySchema.parse(rawQuery);

    const where = {
      ...(action ? { action } : {}),
      ...(targetType ? { targetType } : {}),
    };

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: AuditLogService.INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return ok(entries.map(AuditLogService.serialize), { meta: { page, limit: size, total } });
  }

  private static serialize(entry: {
    id: string;
    action: string;
    targetType: string;
    targetId: string | null;
    metadata: unknown;
    createdAt: Date;
    actor: { fullName: string; email: string };
  }) {
    return {
      id: entry.id,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
      actorFullName: entry.actor.fullName,
      actorEmail: entry.actor.email,
    };
  }
}
