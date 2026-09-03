import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { ECU_FILE_KIND, NOTIFICATION_TYPE, Prisma, TUNING_ORDER_STATUS } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import type { CreateEcuFileInput } from '@/inputs/ecu-file.input';
import type { SetTuningResultsInput, TuningOrderQuery, UpdateTuningOrderStatusInput } from '@/inputs/tuning-order.input';
import { TuningOrderQuerySchema } from '@/inputs/tuning-order.input';
import { EcuFileKindNotAllowedException, TuningOrderNotFoundException } from '@/exceptions/tuning-order.exceptions';
import { TunerProfileNotFoundException } from '@/exceptions/tuner.exceptions';
import { NotificationService } from '@/services/notification.service';

// types

const TERMINAL_STATUSES: TUNING_ORDER_STATUS[] = [TUNING_ORDER_STATUS.COMPLETED, TUNING_ORDER_STATUS.CANCELLED];

@Injectable()
export class TunerOrderService {
  private static readonly INCLUDE = {
    serviceCatalogItem: true,
    user: { select: { fullName: true } },
    files: { orderBy: { createdAt: 'asc' } },
  } as const satisfies Prisma.TuningOrderInclude;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private notificationService!: NotificationService;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async list(rawQuery: unknown) {
    const { status, page, size }: TuningOrderQuery = TuningOrderQuerySchema.parse(rawQuery);
    const tuner = await this.getMyTunerOrThrow();
    const where = { tunerId: tuner.id, ...(status ? { status } : {}) };

    const [orders, total] = await Promise.all([
      prisma.tuningOrder.findMany({
        where,
        include: TunerOrderService.INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.tuningOrder.count({ where }),
    ]);

    return ok(orders.map(TunerOrderService.serialize), { meta: { page, limit: size, total } });
  }

  async get(orderId: string) {
    return ok(TunerOrderService.serialize(await this.getOwnedOrThrow(orderId)));
  }

  async updateStatus(orderId: string, input: UpdateTuningOrderStatusInput) {
    const order = await this.getOwnedOrThrow(orderId);
    if (TERMINAL_STATUSES.includes(order.status)) throw new TuningOrderNotFoundException(orderId);

    const updated = await prisma.tuningOrder.update({
      where: { id: orderId },
      data: { status: input.status },
      include: TunerOrderService.INCLUDE,
    });

    await this.notificationService.create({ userId: order.userId, type: NOTIFICATION_TYPE.TUNING_ORDER_STATUS_CHANGED });

    return ok(TunerOrderService.serialize(updated));
  }

  async setResults(orderId: string, input: SetTuningResultsInput) {
    const order = await this.getOwnedOrThrow(orderId);

    const hasAfterValue = input.powerAfterHp !== undefined || input.torqueAfterNm !== undefined || input.fuelConsumptionAfter !== undefined;
    const resultsVerified = order.status === TUNING_ORDER_STATUS.COMPLETED && hasAfterValue;

    const updated = await prisma.tuningOrder.update({
      where: { id: orderId },
      data: { ...input, resultsVerified },
      include: TunerOrderService.INCLUDE,
    });

    return ok(TunerOrderService.serialize(updated));
  }

  async uploadFile(orderId: string, input: CreateEcuFileInput) {
    await this.getOwnedOrThrow(orderId);
    if (input.kind === ECU_FILE_KIND.LOG) {
      throw new EcuFileKindNotAllowedException();
    }

    const file = await prisma.ecuFile.create({
      data: { ...input, tuningOrderId: orderId, uploadedById: this.currentUserId },
    });

    return ok({ ...file, createdAt: file.createdAt.toISOString() });
  }

  private async getMyTunerOrThrow() {
    const userId = this.currentUserId;
    const tuner = await prisma.tunerProfile.findUnique({ where: { userId } });
    if (!tuner) throw new TunerProfileNotFoundException(userId);
    return tuner;
  }

  private async getOwnedOrThrow(orderId: string) {
    const tuner = await this.getMyTunerOrThrow();
    const order = await prisma.tuningOrder.findFirst({
      where: { id: orderId, tunerId: tuner.id },
      include: TunerOrderService.INCLUDE,
    });
    if (!order) throw new TuningOrderNotFoundException(orderId);
    return order;
  }

  private static serialize(order: Prisma.TuningOrderGetPayload<{ include: typeof TunerOrderService.INCLUDE }>) {
    return {
      id: order.id,
      tunerId: order.tunerId,
      userId: order.userId,
      customerName: order.user.fullName,
      userVehicleId: order.userVehicleId,
      serviceCatalogItemId: order.serviceCatalogItemId,
      problemDescription: order.problemDescription,
      status: order.status,
      powerBeforeHp: order.powerBeforeHp,
      powerAfterHp: order.powerAfterHp,
      torqueBeforeNm: order.torqueBeforeNm,
      torqueAfterNm: order.torqueAfterNm,
      fuelConsumptionBefore: order.fuelConsumptionBefore,
      fuelConsumptionAfter: order.fuelConsumptionAfter,
      resultsVerified: order.resultsVerified,
      createdAt: order.createdAt.toISOString(),
      serviceCatalogItem: serializeServiceCatalogItem(order.serviceCatalogItem),
      files: order.files.map((file) => ({ ...file, createdAt: file.createdAt.toISOString() })),
    };
  }
}
