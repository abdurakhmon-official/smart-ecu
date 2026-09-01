import { z } from 'zod';
import type { ServiceCatalogItemOutput } from '../service-catalog/service-catalog-item.schema';

// schemas

export const OrderStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const CreateOrderInputSchema = z.object({
  userVehicleId: z.string().uuid().optional(),
  serviceCatalogItemId: z.string().uuid(),
  problemDescription: z.string().min(1).max(2000),
  city: z.string().min(1).max(80),
  phone: z.string().min(5).max(20),
});

export const OrderQuerySchema = z.object({
  status: OrderStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

// types

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;

// interfaces

export interface OrderOutput {
  id: string;
  userId: string;
  customerName: string;
  userVehicleId: string | null;
  serviceCatalogItemId: string;
  problemDescription: string;
  city: string;
  phone: string;
  status: OrderStatus;
  acceptedServiceProviderId: string | null;
  createdAt: string;
  serviceCatalogItem: ServiceCatalogItemOutput;
  hasReview: boolean;
}
