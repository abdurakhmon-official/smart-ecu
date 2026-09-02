import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { NOTIFICATION_TYPE, ORDER_STATUS, SERVICE_STATUS, Prisma } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import { OrderQuerySchema } from '@/inputs/order.input';
import type { CreateOrderInput } from '@/inputs/order.input';
import type { CreateReviewInput } from '@/inputs/review.input';
import { OrderNotCancellableException, OrderNotFoundException } from '@/exceptions/order.exceptions';
import { OrderNotCompletedException, ReviewAlreadyExistsException } from '@/exceptions/review.exceptions';
import { UserVehicleNotFoundException } from '@/exceptions/my-garage.exceptions';
import { NotificationService } from '@/services/notification.service';

@Injectable()
export class MyOrdersService {
  private static readonly ORDER_INCLUDE = {
    serviceCatalogItem: true,
    review: true,
    acceptedServiceProvider: { select: { userId: true, name: true } },
  } as const satisfies Prisma.OrderInclude;

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

  async create(input: CreateOrderInput) {
    const userId = this.currentUserId;

    if (input.userVehicleId) {
      const vehicle = await prisma.userVehicle.findFirst({ where: { id: input.userVehicleId, userId, deletedAt: null } });
      if (!vehicle) throw new UserVehicleNotFoundException(input.userVehicleId);
    }

    const recipients = await prisma.serviceProvider.findMany({
      where: {
        status: SERVICE_STATUS.VERIFIED,
        deletedAt: null,
        city: { equals: input.city, mode: 'insensitive' },
        offerings: { some: { serviceCatalogItemId: input.serviceCatalogItemId } },
      },
      select: { id: true, userId: true },
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({ data: { ...input, userId }, include: MyOrdersService.ORDER_INCLUDE });

      if (recipients.length) {
        await tx.orderRecipient.createMany({
          data: recipients.map((recipient) => ({ orderId: created.id, serviceProviderId: recipient.id })),
        });
      }

      return created;
    });

    await Promise.all(
      recipients.map((recipient) =>
        this.notificationService.create({ userId: recipient.userId, type: NOTIFICATION_TYPE.ORDER_RECEIVED, orderId: order.id }),
      ),
    );

    return ok(this.serialize(order));
  }

  async list(rawQuery: unknown) {
    const { status, page, size } = OrderQuerySchema.parse(rawQuery);
    const userId = this.currentUserId;
    const where = { userId, ...(status ? { status } : {}) };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: MyOrdersService.ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.order.count({ where }),
    ]);

    return ok(orders.map((order) => this.serialize(order)), { meta: { page, limit: size, total } });
  }

  async get(orderId: string) {
    const order = await this.getOwnedOrThrow(orderId);
    return ok(this.serialize(order));
  }

  async cancel(orderId: string) {
    const order = await this.getOwnedOrThrow(orderId);
    if (order.status !== ORDER_STATUS.NEW) throw new OrderNotCancellableException();

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.CANCELLED },
      include: MyOrdersService.ORDER_INCLUDE,
    });

    return ok(this.serialize(updated));
  }

  async review(orderId: string, input: CreateReviewInput) {
    const order = await this.getOwnedOrThrow(orderId);
    if (order.status !== ORDER_STATUS.COMPLETED || !order.acceptedServiceProvider) {
      throw new OrderNotCompletedException();
    }
    if (order.review) throw new ReviewAlreadyExistsException();

    const userId = this.currentUserId;
    const serviceProviderId = order.acceptedServiceProviderId as string;

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({ data: { orderId, userId, serviceProviderId, ...input } });

      const aggregate = await tx.review.aggregate({ where: { serviceProviderId }, _avg: { rating: true }, _count: true });
      await tx.serviceProvider.update({
        where: { id: serviceProviderId },
        data: { ratingAvg: aggregate._avg.rating ?? 0, ratingCount: aggregate._count },
      });

      return created;
    });

    await this.notificationService.create({
      userId: order.acceptedServiceProvider.userId,
      type: NOTIFICATION_TYPE.REVIEW_RECEIVED,
      orderId,
    });

    return ok(this.serializeReview(review, order.acceptedServiceProvider.name));
  }

  private async getOwnedOrThrow(orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: this.currentUserId },
      include: MyOrdersService.ORDER_INCLUDE,
    });
    if (!order) throw new OrderNotFoundException(orderId);
    return order;
  }

  private serialize(order: Prisma.OrderGetPayload<{ include: typeof MyOrdersService.ORDER_INCLUDE }>) {
    return {
      id: order.id,
      userId: order.userId,
      customerName: this.currentUser?.fullName ?? '',
      userVehicleId: order.userVehicleId,
      serviceCatalogItemId: order.serviceCatalogItemId,
      problemDescription: order.problemDescription,
      city: order.city,
      phone: order.phone,
      status: order.status,
      acceptedServiceProviderId: order.acceptedServiceProviderId,
      createdAt: order.createdAt.toISOString(),
      serviceCatalogItem: serializeServiceCatalogItem(order.serviceCatalogItem),
      hasReview: Boolean(order.review),
    };
  }

  private serializeReview(
    review: {
      id: string;
      orderId: string;
      userId: string;
      serviceProviderId: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
    },
    serviceProviderName: string,
  ) {
    return {
      id: review.id,
      orderId: review.orderId,
      userId: review.userId,
      customerName: this.currentUser?.fullName ?? '',
      serviceProviderId: review.serviceProviderId,
      serviceProviderName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
