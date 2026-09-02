import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { Prisma, SERVICE_STATUS } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { AdminTunerQuerySchema, TunerQuerySchema } from '@/inputs/tuner-profile.input';
import { TunerProfileNotFoundException } from '@/exceptions/tuner.exceptions';
import { AuditLogService } from '@/services/audit-log.service';

// types

interface TunerFilters {
  status?: SERVICE_STATUS;
  city?: string;
  brandId?: string;
  search?: string;
}

@Injectable()
export class TunerService {
  private static readonly INCLUDE = { brands: true } as const satisfies Prisma.TunerProfileInclude;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private auditLogService!: AuditLogService;

  async list(rawQuery: unknown) {
    const { city, brandId, search, page, size } = TunerQuerySchema.parse(rawQuery);

    const where = TunerService.buildWhere({ status: SERVICE_STATUS.VERIFIED, city, brandId, search });
    const [tuners, total] = await this.findPage(where, page, size);

    return ok(tuners.map(TunerService.serialize), { meta: { page, limit: size, total } });
  }

  async getById(id: string) {
    const tuner = await prisma.tunerProfile.findFirst({
      where: { id, status: SERVICE_STATUS.VERIFIED, deletedAt: null },
      include: TunerService.INCLUDE,
    });
    if (!tuner) throw new TunerProfileNotFoundException(id);

    return ok(TunerService.serialize(tuner));
  }

  async adminList(rawQuery: unknown) {
    const { status, city, brandId, search, page, size } = AdminTunerQuerySchema.parse(rawQuery);

    const where = TunerService.buildWhere({ status, city, brandId, search });
    const [tuners, total] = await this.findPage(where, page, size);

    return ok(tuners.map(TunerService.serialize), { meta: { page, limit: size, total } });
  }

  async verify(id: string) {
    const tuner = await this.getAdminOrThrow(id);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: tuner.userId }, data: { role: 'TUNER' } });
      return tx.tunerProfile.update({ where: { id }, data: { status: SERVICE_STATUS.VERIFIED }, include: TunerService.INCLUDE });
    });

    await this.recordModeration('TUNER_PROFILE_VERIFIED', id);

    return ok(TunerService.serialize(updated));
  }

  async suspend(id: string) {
    await this.getAdminOrThrow(id);
    const updated = await prisma.tunerProfile.update({
      where: { id },
      data: { status: SERVICE_STATUS.SUSPENDED },
      include: TunerService.INCLUDE,
    });

    await this.recordModeration('TUNER_PROFILE_SUSPENDED', id);

    return ok(TunerService.serialize(updated));
  }

  private async findPage(where: Prisma.TunerProfileWhereInput, page: number, size: number) {
    return Promise.all([
      prisma.tunerProfile.findMany({
        where,
        include: TunerService.INCLUDE,
        orderBy: [{ ratingAvg: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.tunerProfile.count({ where }),
    ]);
  }

  private async getAdminOrThrow(id: string) {
    const tuner = await prisma.tunerProfile.findUnique({ where: { id } });
    if (!tuner) throw new TunerProfileNotFoundException(id);
    return tuner;
  }

  private async recordModeration(action: string, targetId: string): Promise<void> {
    await this.auditLogService.record({
      actorId: requireUserId(this.context.getRequest<Request>().user),
      action,
      targetType: 'TunerProfile',
      targetId,
    });
  }

  private static buildWhere(filters: TunerFilters): Prisma.TunerProfileWhereInput {
    return {
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
      ...(filters.brandId ? { brands: { some: { id: filters.brandId } } } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
    };
  }

  private static serialize(tuner: Prisma.TunerProfileGetPayload<{ include: typeof TunerService.INCLUDE }>) {
    return {
      id: tuner.id,
      userId: tuner.userId,
      name: tuner.name,
      description: tuner.description,
      logo: tuner.logo,
      city: tuner.city,
      address: tuner.address,
      lat: tuner.lat,
      lng: tuner.lng,
      phone: tuner.phone,
      telegram: tuner.telegram,
      whatsapp: tuner.whatsapp,
      instagram: tuner.instagram,
      workingHours: tuner.workingHours,
      status: tuner.status,
      ratingAvg: tuner.ratingAvg,
      ratingCount: tuner.ratingCount,
      createdAt: tuner.createdAt.toISOString(),
      brands: tuner.brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        createdAt: brand.createdAt.toISOString(),
      })),
    };
  }
}
