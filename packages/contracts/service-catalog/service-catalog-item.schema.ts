import { z } from 'zod';
import { LocalizedTextSchema, type LocalizedText } from '../common/localized-text';

// schemas

export const CreateServiceCatalogItemInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case'),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
});

export const UpdateServiceCatalogItemInputSchema = z.object({
  name: LocalizedTextSchema.optional(),
  description: LocalizedTextSchema.optional(),
});

// types

export type CreateServiceCatalogItemInput = z.infer<typeof CreateServiceCatalogItemInputSchema>;
export type UpdateServiceCatalogItemInput = z.infer<typeof UpdateServiceCatalogItemInputSchema>;

// interfaces

export interface ServiceCatalogItemOutput {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
  createdAt: string;
}
