import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { requireUserId } from '@/utils/errors.utils';
import { ok } from '@/utils/response.utils';
import type { CreateUserVehicleInput, UpdateUserVehicleInput } from '@/inputs/my-garage.input';
import { UserVehicleNotFoundException } from '@/exceptions/my-garage.exceptions';

@Injectable()
export class MyGarageService {
  private static readonly VEHICLE_INCLUDE = {
    engineOption: {
      include: { generation: { include: { model: { include: { brand: true } } } } },
    },
  } as const;

  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async list() {
    const vehicles = await prisma.userVehicle.findMany({
      where: { userId: this.currentUserId, deletedAt: null },
      include: MyGarageService.VEHICLE_INCLUDE,
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    return ok(vehicles.map(MyGarageService.serialize));
  }

  async create(input: CreateUserVehicleInput) {
    const userId = this.currentUserId;
    const isFirstVehicle = (await prisma.userVehicle.count({ where: { userId, deletedAt: null } })) === 0;
    const isPrimary = input.isPrimary ?? isFirstVehicle;

    const vehicle = await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.userVehicle.updateMany({ where: { userId, deletedAt: null }, data: { isPrimary: false } });
      }

      return tx.userVehicle.create({
        data: { ...input, userId, isPrimary },
        include: MyGarageService.VEHICLE_INCLUDE,
      });
    });

    return ok(MyGarageService.serialize(vehicle));
  }

  async update(vehicleId: string, input: UpdateUserVehicleInput) {
    const userId = this.currentUserId;
    await this.getOwnedOrThrow(vehicleId, userId);

    const vehicle = await prisma.$transaction(async (tx) => {
      if (input.isPrimary) {
        await tx.userVehicle.updateMany({
          where: { userId, deletedAt: null, id: { not: vehicleId } },
          data: { isPrimary: false },
        });
      }

      return tx.userVehicle.update({ where: { id: vehicleId }, data: input, include: MyGarageService.VEHICLE_INCLUDE });
    });

    return ok(MyGarageService.serialize(vehicle));
  }

  async remove(vehicleId: string) {
    const userId = this.currentUserId;
    const vehicle = await this.getOwnedOrThrow(vehicleId, userId);

    await prisma.$transaction(async (tx) => {
      await tx.userVehicle.update({ where: { id: vehicleId }, data: { deletedAt: new Date() } });

      if (vehicle.isPrimary) {
        const next = await tx.userVehicle.findFirst({
          where: { userId, deletedAt: null, id: { not: vehicleId } },
          orderBy: { createdAt: 'asc' },
        });

        if (next) await tx.userVehicle.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    });

    return ok(null);
  }

  private async getOwnedOrThrow(vehicleId: string, userId: string) {
    const vehicle = await prisma.userVehicle.findFirst({ where: { id: vehicleId, userId, deletedAt: null } });
    if (!vehicle) throw new UserVehicleNotFoundException(vehicleId);
    return vehicle;
  }

  private static serialize<
    T extends {
      createdAt: Date;
      engineOption:
        | ({ createdAt: Date; generation: { createdAt: Date; model: { createdAt: Date; brand: { createdAt: Date } } } })
        | null;
    },
  >(vehicle: T) {
    return {
      ...vehicle,
      createdAt: vehicle.createdAt.toISOString(),
      engineOption: vehicle.engineOption
        ? {
            ...vehicle.engineOption,
            createdAt: vehicle.engineOption.createdAt.toISOString(),
            generation: {
              ...vehicle.engineOption.generation,
              createdAt: vehicle.engineOption.generation.createdAt.toISOString(),
              model: {
                ...vehicle.engineOption.generation.model,
                createdAt: vehicle.engineOption.generation.model.createdAt.toISOString(),
                brand: {
                  ...vehicle.engineOption.generation.model.brand,
                  createdAt: vehicle.engineOption.generation.model.brand.createdAt.toISOString(),
                },
              },
            },
          }
        : null,
    };
  }
}
