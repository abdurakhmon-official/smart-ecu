import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { Prisma } from '../generated/prisma';
import { requireUserId } from '@/utils/errors.utils';
import { ok } from '@/utils/response.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import type { CreateServiceProviderInput, UpdateServiceProviderInput } from '@/inputs/service-provider.input';
import type { CreateServiceOfferingInput, UpdateServiceOfferingInput } from '@/inputs/service-offering.input';
import {
  ServiceOfferingNotFoundException,
  ServiceProviderAlreadyExistsException,
  ServiceProviderNotFoundException,
} from '@/exceptions/service-provider.exceptions';

@Injectable()
export class MyServiceService {
  private static readonly INCLUDE = {
    brands: true,
    offerings: { include: { serviceCatalogItem: true } },
  } as const satisfies Prisma.ServiceProviderInclude;

  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async getMine() {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: this.currentUserId },
      include: MyServiceService.INCLUDE,
    });

    return ok(provider ? MyServiceService.serialize(provider) : null);
  }

  async apply(input: CreateServiceProviderInput) {
    const userId = this.currentUserId;
    const existing = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (existing) throw new ServiceProviderAlreadyExistsException();

    const { brandIds, ...data } = input;
    const provider = await prisma.serviceProvider.create({
      data: { ...data, userId, ...(brandIds ? { brands: { connect: brandIds.map((id) => ({ id })) } } : {}) },
      include: MyServiceService.INCLUDE,
    });

    return ok(MyServiceService.serialize(provider));
  }

  async update(input: UpdateServiceProviderInput) {
    const userId = this.currentUserId;
    await this.getOwnOrThrow(userId);

    const { brandIds, ...data } = input;
    const provider = await prisma.serviceProvider.update({
      where: { userId },
      data: { ...data, ...(brandIds ? { brands: { set: brandIds.map((id) => ({ id })) } } : {}) },
      include: MyServiceService.INCLUDE,
    });

    return ok(MyServiceService.serialize(provider));
  }

  async addOffering(input: CreateServiceOfferingInput) {
    const provider = await this.getOwnOrThrow(this.currentUserId);
    const offering = await prisma.serviceOffering.create({
      data: { serviceProviderId: provider.id, ...input },
      include: { serviceCatalogItem: true },
    });

    return ok(MyServiceService.serializeOffering(offering));
  }

  async updateOffering(offeringId: string, input: UpdateServiceOfferingInput) {
    await this.getOwnOfferingOrThrow(offeringId, this.currentUserId);
    const offering = await prisma.serviceOffering.update({
      where: { id: offeringId },
      data: input,
      include: { serviceCatalogItem: true },
    });

    return ok(MyServiceService.serializeOffering(offering));
  }

  async removeOffering(offeringId: string) {
    await this.getOwnOfferingOrThrow(offeringId, this.currentUserId);
    await prisma.serviceOffering.delete({ where: { id: offeringId } });
    return ok(null);
  }

  private async getOwnOrThrow(userId: string) {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (!provider) throw new ServiceProviderNotFoundException(userId);
    return provider;
  }

  private async getOwnOfferingOrThrow(offeringId: string, userId: string) {
    const offering = await prisma.serviceOffering.findFirst({
      where: { id: offeringId, serviceProvider: { userId } },
    });
    if (!offering) throw new ServiceOfferingNotFoundException(offeringId);
    return offering;
  }

  private static serialize(provider: Prisma.ServiceProviderGetPayload<{ include: typeof MyServiceService.INCLUDE }>) {
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
      offerings: provider.offerings.map(MyServiceService.serializeOffering),
    };
  }

  private static serializeOffering(
    offering: Prisma.ServiceOfferingGetPayload<{ include: { serviceCatalogItem: true } }>,
  ) {
    return {
      id: offering.id,
      serviceProviderId: offering.serviceProviderId,
      serviceCatalogItemId: offering.serviceCatalogItemId,
      priceMin: offering.priceMin,
      priceMax: offering.priceMax,
      createdAt: offering.createdAt.toISOString(),
      serviceCatalogItem: serializeServiceCatalogItem(offering.serviceCatalogItem),
    };
  }
}
