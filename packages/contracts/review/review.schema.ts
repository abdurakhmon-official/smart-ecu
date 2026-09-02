import { z } from 'zod';

// schemas

export const CreateReviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const ReviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const AdminReviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

// types

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;
export type ReviewQuery = z.infer<typeof ReviewQuerySchema>;
export type AdminReviewQuery = z.infer<typeof AdminReviewQuerySchema>;

// interfaces

export interface ReviewOutput {
  id: string;
  orderId: string;
  userId: string;
  customerName: string;
  serviceProviderId: string;
  serviceProviderName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
