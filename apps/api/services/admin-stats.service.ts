import { Inject, Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { ok } from '@/utils/response.utils';
import { ORDER_STATUS, SERVICE_STATUS } from '../generated/prisma';
import { UserService } from '@/services/user.service';

@Injectable()
export class AdminStatsService {
  @Inject()
  private userService!: UserService;

  async get() {
    const [users, providersByStatus, ordersByStatus, vehicleCount, reviewAggregate, aiConversationCount] = await Promise.all([
      this.userService.countByRole(),
      prisma.serviceProvider.groupBy({ by: ['status'], _count: true, where: { deletedAt: null } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.userVehicle.count({ where: { deletedAt: null } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
      prisma.aiConversation.count(),
    ]);

    const providerCount = (status: SERVICE_STATUS) => providersByStatus.find((g) => g.status === status)?._count ?? 0;
    const orderCount = (status: ORDER_STATUS) => ordersByStatus.find((g) => g.status === status)?._count ?? 0;

    return ok({
      users,
      serviceProviders: {
        total: providersByStatus.reduce((sum, g) => sum + g._count, 0),
        pending: providerCount(SERVICE_STATUS.PENDING),
        verified: providerCount(SERVICE_STATUS.VERIFIED),
        suspended: providerCount(SERVICE_STATUS.SUSPENDED),
      },
      orders: {
        total: ordersByStatus.reduce((sum, g) => sum + g._count, 0),
        new: orderCount(ORDER_STATUS.NEW),
        inProgress: orderCount(ORDER_STATUS.IN_PROGRESS),
        completed: orderCount(ORDER_STATUS.COMPLETED),
        cancelled: orderCount(ORDER_STATUS.CANCELLED),
      },
      vehicles: vehicleCount,
      reviews: { total: reviewAggregate._count, avgRating: reviewAggregate._avg.rating ?? 0 },
      aiConversations: aiConversationCount,
    });
  }
}
