import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { Prisma } from '../generated/prisma';
import { requireUserId } from '@/utils/errors.utils';
import { ok } from '@/utils/response.utils';
import type { CreateTunerProfileInput, UpdateTunerProfileInput } from '@/inputs/tuner-profile.input';
import { TunerProfileAlreadyExistsException, TunerProfileNotFoundException } from '@/exceptions/tuner.exceptions';

@Injectable()
export class MyTunerService {
  private static readonly INCLUDE = { brands: true } as const satisfies Prisma.TunerProfileInclude;

  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async getMine() {
    const tuner = await prisma.tunerProfile.findUnique({
      where: { userId: this.currentUserId },
      include: MyTunerService.INCLUDE,
    });

    return ok(tuner ? MyTunerService.serialize(tuner) : null);
  }

  async apply(input: CreateTunerProfileInput) {
    const userId = this.currentUserId;
    const existing = await prisma.tunerProfile.findUnique({ where: { userId } });
    if (existing) throw new TunerProfileAlreadyExistsException();

    const { brandIds, ...data } = input;
    const tuner = await prisma.tunerProfile.create({
      data: { ...data, userId, ...(brandIds ? { brands: { connect: brandIds.map((id) => ({ id })) } } : {}) },
      include: MyTunerService.INCLUDE,
    });

    return ok(MyTunerService.serialize(tuner));
  }

  async update(input: UpdateTunerProfileInput) {
    const userId = this.currentUserId;
    await this.getOwnOrThrow(userId);

    const { brandIds, ...data } = input;
    const tuner = await prisma.tunerProfile.update({
      where: { userId },
      data: { ...data, ...(brandIds ? { brands: { set: brandIds.map((id) => ({ id })) } } : {}) },
      include: MyTunerService.INCLUDE,
    });

    return ok(MyTunerService.serialize(tuner));
  }

  private async getOwnOrThrow(userId: string) {
    const tuner = await prisma.tunerProfile.findUnique({ where: { userId } });
    if (!tuner) throw new TunerProfileNotFoundException(userId);
    return tuner;
  }

  private static serialize(tuner: Prisma.TunerProfileGetPayload<{ include: typeof MyTunerService.INCLUDE }>) {
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
