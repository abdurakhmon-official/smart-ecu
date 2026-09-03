import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { NOTIFICATION_TYPE, ORDER_STATUS, Prisma } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import { OrderQuerySchema } from '@/inputs/order.input';
import { OrderNotAcceptableException, OrderNotFoundException, OrderNotYoursToCompleteException } from '@/exceptions/order.exceptions';
import { ServiceProviderNotFoundException } from '@/exceptions/service-provider.exceptions';
import { NotificationService } from '@/services/notification.service';

@Injectable()
export class ServiceOrderService {
  private static readonly ORDER_INCLUDE = {
    serviceCatalogItem: true,
    user: { select: { fullName: true } },
  } as const satisfies Prisma.OrderInclude;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private notificationService!: NotificationService;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async list(rawQuery: unknown) {
    const { status, page, size } = OrderQuerySchema.parse(rawQuery);
    const provider = await this.getMyProviderOrThrow();

    const where = {
      recipients: { some: { serviceProviderId: provider.id } },
      ...(status ? { status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: ServiceOrderService.ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.order.count({ where }),
    ]);

    return ok(orders.map((order) => ServiceOrderService.serialize(order)), { meta: { page, limit: size, total } });
  }

  async accept(orderId: string) {
    const provider = await this.getMyProviderOrThrow();

    const isRecipient = await prisma.orderRecipient.findUnique({
      where: { orderId_serviceProviderId: { orderId, serviceProviderId: provider.id } },
    });
    if (!isRecipient) throw new OrderNotFoundException(orderId);

    const result = await prisma.order.updateMany({
      where: { id: orderId, status: ORDER_STATUS.NEW },
      data: { status: ORDER_STATUS.IN_PROGRESS, acceptedServiceProviderId: provider.id },
    });
    if (result.count === 0) throw new OrderNotAcceptableException();

    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: ServiceOrderService.ORDER_INCLUDE });
    await this.notificationService.create({ userId: order.userId, type: NOTIFICATION_TYPE.ORDER_ACCEPTED, orderId });

    return ok(ServiceOrderService.serialize(order));
  }

  async complete(orderId: string) {
    const provider = await this.getMyProviderOrThrow();

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new OrderNotFoundException(orderId);
    if (existing.acceptedServiceProviderId !== provider.id) throw new OrderNotYoursToCompleteException();
    if (existing.status !== ORDER_STATUS.IN_PROGRESS) throw new OrderNotAcceptableException();

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.COMPLETED },
      include: ServiceOrderService.ORDER_INCLUDE,
    });
    await this.notificationService.create({ userId: updated.userId, type: NOTIFICATION_TYPE.ORDER_COMPLETED, orderId });

    return ok(ServiceOrderService.serialize(updated));
  }

  private async getMyProviderOrThrow() {
    const userId = this.currentUserId;
    const provider = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (!provider) throw new ServiceProviderNotFoundException(userId);
    return provider;
  }

  private static serialize(order: Prisma.OrderGetPayload<{ include: typeof ServiceOrderService.ORDER_INCLUDE }>) {
    return {
      id: order.id,
      userId: order.userId,
      customerName: order.user.fullName,
      userVehicleId: order.userVehicleId,
      serviceCatalogItemId: order.serviceCatalogItemId,
      problemDescription: order.problemDescription,
      city: order.city,
      phone: order.phone,
      status: order.status,
      acceptedServiceProviderId: order.acceptedServiceProviderId,
      createdAt: order.createdAt.toISOString(),
      serviceCatalogItem: serializeServiceCatalogItem(order.serviceCatalogItem),
      hasReview: false,
    };
  }
}
