import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { ok } from '@/utils/response.utils';
import { ReviewQuerySchema } from '@/inputs/review.input';

@Injectable()
export class ReviewService {
  async listForProvider(serviceProviderId: string, rawQuery: unknown) {
    const { page, size } = ReviewQuerySchema.parse(rawQuery);
    const where = { serviceProviderId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.review.count({ where }),
    ]);

    return ok(reviews.map(ReviewService.serialize), { meta: { page, limit: size, total } });
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
  }) {
    return {
      id: review.id,
      orderId: review.orderId,
      userId: review.userId,
      customerName: review.user.fullName,
      serviceProviderId: review.serviceProviderId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
