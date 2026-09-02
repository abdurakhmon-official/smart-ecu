import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { Prisma, SERVICE_STATUS } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import { ServiceProviderQuerySchema, AdminServiceProviderQuerySchema } from '@/inputs/service-provider.input';
import { ServiceProviderNotFoundException } from '@/exceptions/service-provider.exceptions';
import { AuditLogService } from '@/services/audit-log.service';

// types

interface ProviderFilters {
  status?: SERVICE_STATUS;
  city?: string;
  brandId?: string;
  serviceCatalogItemId?: string;
  search?: string;
}

@Injectable()
export class ServiceProviderService {
  private static readonly INCLUDE = {
    brands: true,
    offerings: { include: { serviceCatalogItem: true } },
  } as const satisfies Prisma.ServiceProviderInclude;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private auditLogService!: AuditLogService;

  async list(rawQuery: unknown) {
    const { city, brandId, serviceCatalogItemId, search, page, size } = ServiceProviderQuerySchema.parse(rawQuery);

    const where = ServiceProviderService.buildWhere({ status: SERVICE_STATUS.VERIFIED, city, brandId, serviceCatalogItemId, search });
    const [providers, total] = await this.findPage(where, page, size);

    return ok(providers.map(ServiceProviderService.serialize), { meta: { page, limit: size, total } });
  }

  async getById(id: string) {
    const provider = await prisma.serviceProvider.findFirst({
      where: { id, status: SERVICE_STATUS.VERIFIED, deletedAt: null },
      include: ServiceProviderService.INCLUDE,
    });
    if (!provider) throw new ServiceProviderNotFoundException(id);

    return ok(ServiceProviderService.serialize(provider));
  }

  async adminList(rawQuery: unknown) {
    const { status, city, brandId, serviceCatalogItemId, search, page, size } = AdminServiceProviderQuerySchema.parse(rawQuery);

    const where = ServiceProviderService.buildWhere({ status, city, brandId, serviceCatalogItemId, search });
    const [providers, total] = await this.findPage(where, page, size);

    return ok(providers.map(ServiceProviderService.serialize), { meta: { page, limit: size, total } });
  }

  async verify(id: string) {
    const provider = await this.getAdminOrThrow(id);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: provider.userId }, data: { role: 'SERVICE' } });
      return tx.serviceProvider.update({
        where: { id },
        data: { status: SERVICE_STATUS.VERIFIED },
        include: ServiceProviderService.INCLUDE,
      });
    });

    await this.recordModeration('SERVICE_PROVIDER_VERIFIED', id);

    return ok(ServiceProviderService.serialize(updated));
  }

  async suspend(id: string) {
    await this.getAdminOrThrow(id);
    const updated = await prisma.serviceProvider.update({
      where: { id },
      data: { status: SERVICE_STATUS.SUSPENDED },
      include: ServiceProviderService.INCLUDE,
    });

    await this.recordModeration('SERVICE_PROVIDER_SUSPENDED', id);

    return ok(ServiceProviderService.serialize(updated));
  }

  private async recordModeration(action: string, targetId: string): Promise<void> {
    await this.auditLogService.record({
      actorId: requireUserId(this.context.getRequest<Request>().user),
      action,
      targetType: 'ServiceProvider',
      targetId,
    });
  }

  private async findPage(where: Prisma.ServiceProviderWhereInput, page: number, size: number) {
    return Promise.all([
      prisma.serviceProvider.findMany({
        where,
        include: ServiceProviderService.INCLUDE,
        orderBy: [{ ratingAvg: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.serviceProvider.count({ where }),
    ]);
  }

  private async getAdminOrThrow(id: string) {
    const provider = await prisma.serviceProvider.findUnique({ where: { id } });
    if (!provider) throw new ServiceProviderNotFoundException(id);
    return provider;
  }

  private static buildWhere(filters: ProviderFilters): Prisma.ServiceProviderWhereInput {
    return {
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
      ...(filters.brandId ? { brands: { some: { id: filters.brandId } } } : {}),
      ...(filters.serviceCatalogItemId ? { offerings: { some: { serviceCatalogItemId: filters.serviceCatalogItemId } } } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
    };
  }

  private static serialize(provider: Prisma.ServiceProviderGetPayload<{ include: typeof ServiceProviderService.INCLUDE }>) {
    return {
      id: provider.id,
      userId: provider.userId,
      name: provider.name,
      description: provider.description,
      logo: provider.logo,
      city: provider.city,
      address: provider.address,
      lat: provider.lat,
      lng: provider.lng,
      phone: provider.phone,
      telegram: provider.telegram,
      whatsapp: provider.whatsapp,
      instagram: provider.instagram,
      workingHours: provider.workingHours,
      status: provider.status,
      ratingAvg: provider.ratingAvg,
      ratingCount: provider.ratingCount,
      createdAt: provider.createdAt.toISOString(),
      brands: provider.brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        createdAt: brand.createdAt.toISOString(),
      })),
      offerings: provider.offerings.map((offering) => ({
        id: offering.id,
        serviceProviderId: offering.serviceProviderId,
        serviceCatalogItemId: offering.serviceCatalogItemId,
        priceMin: offering.priceMin,
        priceMax: offering.priceMax,
        createdAt: offering.createdAt.toISOString(),
        serviceCatalogItem: serializeServiceCatalogItem(offering.serviceCatalogItem),
      })),
    };
  }
}
