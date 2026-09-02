import { z } from 'zod';
import type { BrandOutput } from '../vehicle-catalog/brand.schema';
import { ServiceStatusSchema, type ServiceStatus } from '../service-provider/service-provider.schema';

// schemas

export const CreateTunerProfileInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  logo: z.string().url().optional(),
  city: z.string().min(1).max(80),
  address: z.string().max(200).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  phone: z.string().min(5).max(20),
  telegram: z.string().max(80).optional(),
  whatsapp: z.string().max(80).optional(),
  instagram: z.string().max(80).optional(),
  workingHours: z.string().max(200).optional(),
  brandIds: z.array(z.string().uuid()).optional(),
});

export const UpdateTunerProfileInputSchema = CreateTunerProfileInputSchema.partial();

export const TunerQuerySchema = z.object({
  city: z.string().optional(),
  brandId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const AdminTunerQuerySchema = TunerQuerySchema.extend({
  status: ServiceStatusSchema.optional(),
});

// types

export type CreateTunerProfileInput = z.infer<typeof CreateTunerProfileInputSchema>;
export type UpdateTunerProfileInput = z.infer<typeof UpdateTunerProfileInputSchema>;
export type TunerQuery = z.infer<typeof TunerQuerySchema>;
export type AdminTunerQuery = z.infer<typeof AdminTunerQuerySchema>;

// interfaces

export interface TunerProfileOutput {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  logo: string | null;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string;
  telegram: string | null;
  whatsapp: string | null;
  instagram: string | null;
  workingHours: string | null;
  status: ServiceStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  brands: BrandOutput[];
}
