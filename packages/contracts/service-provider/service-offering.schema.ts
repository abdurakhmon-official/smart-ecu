import { z } from 'zod';
import type { ServiceCatalogItemOutput } from '../service-catalog/service-catalog-item.schema';

// schemas

export const CreateServiceOfferingInputSchema = z
  .object({
    serviceCatalogItemId: z.string().uuid(),
    priceMin: z.coerce.number().int().nonnegative().optional(),
    priceMax: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((input) => !input.priceMin || !input.priceMax || input.priceMax >= input.priceMin, {
    message: 'priceMax must be greater than or equal to priceMin',
    path: ['priceMax'],
  });

export const UpdateServiceOfferingInputSchema = z.object({
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
});

// types

export type CreateServiceOfferingInput = z.infer<typeof CreateServiceOfferingInputSchema>;
export type UpdateServiceOfferingInput = z.infer<typeof UpdateServiceOfferingInputSchema>;

// interfaces

export interface ServiceOfferingOutput {
  id: string;
  serviceProviderId: string;
  serviceCatalogItemId: string;
  priceMin: number | null;
  priceMax: number | null;
  createdAt: string;
  serviceCatalogItem: ServiceCatalogItemOutput;
}
