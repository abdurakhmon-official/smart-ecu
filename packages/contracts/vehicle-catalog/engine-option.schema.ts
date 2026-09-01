import { z } from 'zod';

// schemas

export const FuelTypeSchema = z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG']);

export const TransmissionTypeSchema = z.enum(['MANUAL', 'AUTOMATIC', 'CVT', 'ROBOT']);

export const CreateEngineOptionInputSchema = z.object({
  generationId: z.string().uuid(),
  name: z.string().min(1).max(80),
  volumeLiters: z.coerce.number().positive().max(20).optional(),
  fuel: FuelTypeSchema,
  transmission: TransmissionTypeSchema,
  powerHp: z.coerce.number().int().positive().max(3000).optional(),
});

export const UpdateEngineOptionInputSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  volumeLiters: z.coerce.number().positive().max(20).optional(),
  fuel: FuelTypeSchema.optional(),
  transmission: TransmissionTypeSchema.optional(),
  powerHp: z.coerce.number().int().positive().max(3000).optional(),
});

// types

export type FuelType = z.infer<typeof FuelTypeSchema>;
export type TransmissionType = z.infer<typeof TransmissionTypeSchema>;
export type CreateEngineOptionInput = z.infer<typeof CreateEngineOptionInputSchema>;
export type UpdateEngineOptionInput = z.infer<typeof UpdateEngineOptionInputSchema>;

// interfaces

export interface EngineOptionOutput {
  id: string;
  generationId: string;
  name: string;
  volumeLiters: number | null;
  fuel: FuelType;
  transmission: TransmissionType;
  powerHp: number | null;
  createdAt: string;
}
