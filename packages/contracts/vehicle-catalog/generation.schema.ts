import { z } from 'zod';

// schemas

export const CreateGenerationInputSchema = z
  .object({
    modelId: z.string().uuid(),
    name: z.string().min(1).max(80),
    yearFrom: z.coerce.number().int().min(1950).max(2100),
    yearTo: z.coerce.number().int().min(1950).max(2100).optional(),
  })
  .refine((input) => !input.yearTo || input.yearTo >= input.yearFrom, {
    message: 'yearTo must be greater than or equal to yearFrom',
    path: ['yearTo'],
  });

export const UpdateGenerationInputSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  yearFrom: z.coerce.number().int().min(1950).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1950).max(2100).optional(),
});

// types

export type CreateGenerationInput = z.infer<typeof CreateGenerationInputSchema>;
export type UpdateGenerationInput = z.infer<typeof UpdateGenerationInputSchema>;

// interfaces

export interface GenerationOutput {
  id: string;
  modelId: string;
  name: string;
  yearFrom: number;
  yearTo: number | null;
  createdAt: string;
}
