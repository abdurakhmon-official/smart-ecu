import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import type { VehicleHealthFactor } from '@repo/contracts';
import prisma from '@/modules/db';
import { ORDER_STATUS } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { UserVehicleNotFoundException } from '@/exceptions/my-garage.exceptions';

/**
 * Vehicle Health Score (Bosqich 7, 33-bo'lim) — v1 evristika, tashqi integratsiya kerak
 * emas, faqat mavjud ma'lumotlardan (yosh, probeg, ta'mirlash tarixi) hisoblanadi.
 * Og'irliklar boshlang'ich taxmin — foydalanuvchi fikr-mulohazasi asosida sozlanadi.
 */
@Injectable()
export class VehicleHealthService {
  private static readonly AVERAGE_KM_PER_YEAR = 15_000;
  private static readonly MAINTENANCE_WINDOW_MONTHS = 12;
  private static readonly MAX_AGE_PENALTY = 30;
  private static readonly MAX_MILEAGE_PENALTY = 20;
  private static readonly MAX_MAINTENANCE_BONUS = 20;
  private static readonly NEGLECT_PENALTY = -15;

  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async getScore(vehicleId: string) {
    const vehicle = await prisma.userVehicle.findFirst({
      where: { id: vehicleId, userId: this.currentUserId, deletedAt: null },
      include: { engineOption: { include: { generation: true } } },
    });
    if (!vehicle) throw new UserVehicleNotFoundException(vehicleId);

    const year = vehicle.engineOption?.generation.yearFrom ?? vehicle.customYear ?? null;
    const ageYears = year ? Math.max(0, new Date().getFullYear() - year) : null;

    const factors: VehicleHealthFactor[] = [
      ...VehicleHealthService.ageFactor(ageYears),
      ...VehicleHealthService.mileageFactor(ageYears, vehicle.mileageKm),
      ...(await this.maintenanceFactors(vehicleId, ageYears)),
    ];

    const score = Math.max(0, Math.min(100, 100 + factors.reduce((sum, factor) => sum + factor.delta, 0)));

    return ok({ score, factors });
  }

  private static ageFactor(ageYears: number | null): VehicleHealthFactor[] {
    if (ageYears === null || ageYears <= 5) return [];

    const delta = -Math.min(VehicleHealthService.MAX_AGE_PENALTY, (ageYears - 5) * 2);
    return [{ label: 'VEHICLE_AGE', delta }];
  }

  private static mileageFactor(ageYears: number | null, mileageKm: number | null): VehicleHealthFactor[] {
    if (ageYears === null || ageYears <= 0 || mileageKm === null) return [];

    const expected = ageYears * VehicleHealthService.AVERAGE_KM_PER_YEAR;
    const excess = mileageKm - expected;
    if (excess <= expected * 0.3) return [];

    const delta = -Math.min(VehicleHealthService.MAX_MILEAGE_PENALTY, Math.round((excess / expected) * 20));
    return [{ label: 'HIGH_MILEAGE', delta }];
  }

  private async maintenanceFactors(vehicleId: string, ageYears: number | null): Promise<VehicleHealthFactor[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - VehicleHealthService.MAINTENANCE_WINDOW_MONTHS);

    const recentCompleted = await prisma.order.count({
      where: { userVehicleId: vehicleId, status: ORDER_STATUS.COMPLETED, updatedAt: { gte: since } },
    });

    if (recentCompleted > 0) {
      return [{ label: 'RECENT_MAINTENANCE', delta: Math.min(VehicleHealthService.MAX_MAINTENANCE_BONUS, recentCompleted * 5) }];
    }

    if (ageYears === null || ageYears < 1) return [];

    const everCompleted = await prisma.order.count({ where: { userVehicleId: vehicleId, status: ORDER_STATUS.COMPLETED } });
    if (everCompleted > 0) return [];

    return [{ label: 'NO_SERVICE_HISTORY', delta: VehicleHealthService.NEGLECT_PENALTY }];
  }
}
