import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { Prisma } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import { AdminOrderQuerySchema } from '@/inputs/order.input';

@Injectable()
export class AdminOrderService {
  private static readonly INCLUDE = {
    serviceCatalogItem: true,
    user: { select: { fullName: true } },
    review: { select: { id: true } },
  } as const satisfies Prisma.OrderInclude;

  async list(rawQuery: unknown) {
    const { status, city, page, size } = AdminOrderQuerySchema.parse(rawQuery);

    const where = {
      ...(status ? { status } : {}),
      ...(city ? { city: { equals: city, mode: 'insensitive' as const } } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: AdminOrderService.INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.order.count({ where }),
    ]);

    return ok(orders.map(AdminOrderService.serialize), { meta: { page, limit: size, total } });
  }

  private static serialize(order: Prisma.OrderGetPayload<{ include: typeof AdminOrderService.INCLUDE }>) {
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
      hasReview: Boolean(order.review),
    };
  }
}
