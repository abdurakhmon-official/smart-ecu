import { z } from 'zod';
import type { BrandOutput } from '../vehicle-catalog/brand.schema';
import type { ModelOutput } from '../vehicle-catalog/model.schema';
import type { GenerationOutput } from '../vehicle-catalog/generation.schema';
import type { EngineOptionOutput } from '../vehicle-catalog/engine-option.schema';

// schemas

export const CreateUserVehicleInputSchema = z
  .object({
    engineOptionId: z.string().uuid().optional(),
    customBrand: z.string().min(1).max(80).optional(),
    customModel: z.string().min(1).max(80).optional(),
    customYear: z.coerce.number().int().min(1950).max(2100).optional(),
    vin: z.string().min(1).max(32).optional(),
    plateNumber: z.string().min(1).max(20).optional(),
    mileageKm: z.coerce.number().int().nonnegative().optional(),
    photo: z.string().url().optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine((input) => Boolean(input.engineOptionId) || Boolean(input.customBrand && input.customModel), {
    message: 'Either engineOptionId or customBrand + customModel is required',
    path: ['engineOptionId'],
  });

export const UpdateUserVehicleInputSchema = z.object({
  vin: z.string().min(1).max(32).optional(),
  plateNumber: z.string().min(1).max(20).optional(),
  mileageKm: z.coerce.number().int().nonnegative().optional(),
  photo: z.string().url().optional(),
  isPrimary: z.boolean().optional(),
});

// types

export type CreateUserVehicleInput = z.infer<typeof CreateUserVehicleInputSchema>;
export type UpdateUserVehicleInput = z.infer<typeof UpdateUserVehicleInputSchema>;

// interfaces

export interface UserVehicleOutput {
  id: string;
  userId: string;
  engineOptionId: string | null;
  customBrand: string | null;
  customModel: string | null;
  customYear: number | null;
  vin: string | null;
  plateNumber: string | null;
  mileageKm: number | null;
  photo: string | null;
  isPrimary: boolean;
  createdAt: string;
  engineOption:
    | (EngineOptionOutput & {
        generation: GenerationOutput & { model: ModelOutput & { brand: BrandOutput } };
      })
    | null;
}
