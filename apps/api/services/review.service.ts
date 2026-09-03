import { Inject, InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { AdminReviewQuerySchema, ReviewQuerySchema } from '@/inputs/review.input';
import { ReviewNotFoundException } from '@/exceptions/review.exceptions';
import { AuditLogService } from '@/services/audit-log.service';

@Injectable()
export class ReviewService {
  private static readonly INCLUDE = { user: { select: { fullName: true } }, serviceProvider: { select: { name: true } } } as const;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private auditLogService!: AuditLogService;

  async listForProvider(serviceProviderId: string, rawQuery: unknown) {
    const { page, size } = ReviewQuerySchema.parse(rawQuery);
    const where = { serviceProviderId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: ReviewService.INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.review.count({ where }),
    ]);

    return ok(reviews.map(ReviewService.serialize), { meta: { page, limit: size, total } });
  }

  async adminList(rawQuery: unknown) {
    const { page, size } = AdminReviewQuerySchema.parse(rawQuery);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: ReviewService.INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.review.count(),
    ]);

    return ok(reviews.map(ReviewService.serialize), { meta: { page, limit: size, total } });
  }

  async adminDelete(reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new ReviewNotFoundException(reviewId);

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });

      const aggregate = await tx.review.aggregate({
        where: { serviceProviderId: review.serviceProviderId },
        _avg: { rating: true },
        _count: true,
      });

      await tx.serviceProvider.update({
        where: { id: review.serviceProviderId },
        data: { ratingAvg: aggregate._avg.rating ?? 0, ratingCount: aggregate._count },
      });
    });

    await this.auditLogService.record({
      actorId: requireUserId(this.context.getRequest<Request>().user),
      action: 'REVIEW_DELETED',
      targetType: 'Review',
      targetId: reviewId,
      metadata: { serviceProviderId: review.serviceProviderId, rating: review.rating },
    });

    return ok(null);
  }

  private static serialize(review: {
    id: string;
    orderId: string;
    userId: string;
    serviceProviderId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: { fullName: string };
    serviceProvider: { name: string };
  }) {
    return {
      id: review.id,
      orderId: review.orderId,
      userId: review.userId,
      customerName: review.user.fullName,
      serviceProviderId: review.serviceProviderId,
      serviceProviderName: review.serviceProvider.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
