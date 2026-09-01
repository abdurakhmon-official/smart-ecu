import { z } from 'zod';

// schemas

export const CreateBrandInputSchema = z.object({
  name: z.string().min(1).max(80),
  logo: z.string().url().optional(),
});

export const UpdateBrandInputSchema = CreateBrandInputSchema.partial();

// types

export type CreateBrandInput = z.infer<typeof CreateBrandInputSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandInputSchema>;

// interfaces

export interface BrandOutput {
  id: string;
  name: string;
  logo: string | null;
  createdAt: string;
}
