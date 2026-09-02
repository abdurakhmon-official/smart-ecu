import { z } from 'zod';
import type { ServiceCatalogItemOutput } from '../service-catalog/service-catalog-item.schema';
import type { EcuFileOutput } from './ecu-file.schema';

// schemas

export const TuningOrderStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'WAITING_FOR_LOG', 'READY', 'COMPLETED', 'CANCELLED']);

export const CreateTuningOrderInputSchema = z.object({
  tunerId: z.string().uuid(),
  userVehicleId: z.string().uuid().optional(),
  serviceCatalogItemId: z.string().uuid(),
  problemDescription: z.string().min(1).max(2000),
});

export const TuningOrderQuerySchema = z.object({
  status: TuningOrderStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const UpdateTuningOrderStatusInputSchema = z.object({
  status: TuningOrderStatusSchema,
});

export const SetTuningResultsInputSchema = z.object({
  powerBeforeHp: z.coerce.number().int().nonnegative().optional(),
  powerAfterHp: z.coerce.number().int().nonnegative().optional(),
  torqueBeforeNm: z.coerce.number().int().nonnegative().optional(),
  torqueAfterNm: z.coerce.number().int().nonnegative().optional(),
  fuelConsumptionBefore: z.coerce.number().nonnegative().optional(),
  fuelConsumptionAfter: z.coerce.number().nonnegative().optional(),
});

// types

export type TuningOrderStatus = z.infer<typeof TuningOrderStatusSchema>;
export type CreateTuningOrderInput = z.infer<typeof CreateTuningOrderInputSchema>;
export type TuningOrderQuery = z.infer<typeof TuningOrderQuerySchema>;
export type UpdateTuningOrderStatusInput = z.infer<typeof UpdateTuningOrderStatusInputSchema>;
export type SetTuningResultsInput = z.infer<typeof SetTuningResultsInputSchema>;

// interfaces

export interface TuningOrderOutput {
  id: string;
  tunerId: string;
  userId: string;
  customerName: string;
  userVehicleId: string | null;
  serviceCatalogItemId: string;
  problemDescription: string;
  status: TuningOrderStatus;
  powerBeforeHp: number | null;
  powerAfterHp: number | null;
  torqueBeforeNm: number | null;
  torqueAfterNm: number | null;
  fuelConsumptionBefore: number | null;
  fuelConsumptionAfter: number | null;
  resultsVerified: boolean;
  createdAt: string;
  serviceCatalogItem: ServiceCatalogItemOutput;
  files: EcuFileOutput[];
}
