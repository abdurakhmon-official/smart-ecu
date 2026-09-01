import { z } from 'zod';
import type { BrandOutput } from '../vehicle-catalog/brand.schema';
import type { ServiceOfferingOutput } from './service-offering.schema';

// schemas

export const ServiceStatusSchema = z.enum(['PENDING', 'VERIFIED', 'SUSPENDED']);

export const CreateServiceProviderInputSchema = z.object({
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

export const UpdateServiceProviderInputSchema = CreateServiceProviderInputSchema.partial();

export const ServiceProviderQuerySchema = z.object({
  city: z.string().optional(),
  brandId: z.string().uuid().optional(),
  serviceCatalogItemId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const AdminServiceProviderQuerySchema = ServiceProviderQuerySchema.extend({
  status: ServiceStatusSchema.optional(),
});

// types

export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type CreateServiceProviderInput = z.infer<typeof CreateServiceProviderInputSchema>;
export type UpdateServiceProviderInput = z.infer<typeof UpdateServiceProviderInputSchema>;
export type ServiceProviderQuery = z.infer<typeof ServiceProviderQuerySchema>;
export type AdminServiceProviderQuery = z.infer<typeof AdminServiceProviderQuerySchema>;

// interfaces

export interface ServiceProviderOutput {
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
  offerings: ServiceOfferingOutput[];
}
