import { z } from 'zod';

// schemas

export const CreateModelInputSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(1).max(80),
});

export const UpdateModelInputSchema = z.object({
  name: z.string().min(1).max(80),
});

// types

export type CreateModelInput = z.infer<typeof CreateModelInputSchema>;
export type UpdateModelInput = z.infer<typeof UpdateModelInputSchema>;

// interfaces

export interface ModelOutput {
  id: string;
  brandId: string;
  name: string;
  createdAt: string;
}
