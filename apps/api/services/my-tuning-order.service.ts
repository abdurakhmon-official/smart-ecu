import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { ECU_FILE_KIND, NOTIFICATION_TYPE, Prisma, SERVICE_STATUS, TUNING_ORDER_STATUS } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import type { CreateEcuFileInput } from '@/inputs/ecu-file.input';
import type { CreateTuningOrderInput, TuningOrderQuery } from '@/inputs/tuning-order.input';
import { TuningOrderQuerySchema } from '@/inputs/tuning-order.input';
import {
  EcuFileKindNotAllowedException,
  TuningOrderNotCancellableException,
  TuningOrderNotFoundException,
} from '@/exceptions/tuning-order.exceptions';
import { TunerProfileNotFoundException } from '@/exceptions/tuner.exceptions';
import { NotificationService } from '@/services/notification.service';

@Injectable()
export class MyTuningOrderService {
  private static readonly INCLUDE = {
    serviceCatalogItem: true,
    files: { orderBy: { createdAt: 'asc' } },
  } as const satisfies Prisma.TuningOrderInclude;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private notificationService!: NotificationService;

  private get currentUser() {
    return this.context.getRequest<Request>().user;
  }

  private get currentUserId(): string {
    return requireUserId(this.currentUser);
  }

  async create(input: CreateTuningOrderInput) {
    const tuner = await prisma.tunerProfile.findFirst({ where: { id: input.tunerId, status: SERVICE_STATUS.VERIFIED } });
    if (!tuner) throw new TunerProfileNotFoundException(input.tunerId);

    const order = await prisma.tuningOrder.create({
      data: { ...input, userId: this.currentUserId },
      include: MyTuningOrderService.INCLUDE,
    });

    await this.notificationService.create({ userId: tuner.userId, type: NOTIFICATION_TYPE.TUNING_ORDER_RECEIVED });

    return ok(this.serialize(order));
  }

  async list(rawQuery: unknown) {
    const { status, page, size }: TuningOrderQuery = TuningOrderQuerySchema.parse(rawQuery);
    const userId = this.currentUserId;
    const where = { userId, ...(status ? { status } : {}) };

    const [orders, total] = await Promise.all([
      prisma.tuningOrder.findMany({
        where,
        include: MyTuningOrderService.INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.tuningOrder.count({ where }),
    ]);

    return ok(orders.map((order) => this.serialize(order)), { meta: { page, limit: size, total } });
  }

  async get(orderId: string) {
    return ok(this.serialize(await this.getOwnedOrThrow(orderId)));
  }

  async cancel(orderId: string) {
    const order = await this.getOwnedOrThrow(orderId);
    if (order.status !== TUNING_ORDER_STATUS.NEW) throw new TuningOrderNotCancellableException();

    const updated = await prisma.tuningOrder.update({
      where: { id: orderId },
      data: { status: TUNING_ORDER_STATUS.CANCELLED },
      include: MyTuningOrderService.INCLUDE,
    });

    return ok(this.serialize(updated));
  }

  async uploadFile(orderId: string, input: CreateEcuFileInput) {
    await this.getOwnedOrThrow(orderId);
    if (input.kind !== ECU_FILE_KIND.LOG) {
      throw new EcuFileKindNotAllowedException();
    }

    const file = await prisma.ecuFile.create({
      data: { ...input, tuningOrderId: orderId, uploadedById: this.currentUserId },
    });

    return ok({ ...file, createdAt: file.createdAt.toISOString() });
  }

  private async getOwnedOrThrow(orderId: string) {
    const order = await prisma.tuningOrder.findFirst({
      where: { id: orderId, userId: this.currentUserId },
      include: MyTuningOrderService.INCLUDE,
    });
    if (!order) throw new TuningOrderNotFoundException(orderId);
    return order;
  }

  private serialize(order: Prisma.TuningOrderGetPayload<{ include: typeof MyTuningOrderService.INCLUDE }>) {
    return {
      id: order.id,
      tunerId: order.tunerId,
      userId: order.userId,
      customerName: this.currentUser?.fullName ?? '',
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
