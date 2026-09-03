import type { LocalizedText } from '@repo/contracts';

interface RawServiceCatalogItem {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  createdAt: Date;
}

export const serializeServiceCatalogItem = (item: RawServiceCatalogItem) => ({
  id: item.id,
  slug: item.slug,
  name: item.name as LocalizedText,
  description: item.description as LocalizedText | null,
  createdAt: item.createdAt.toISOString(),
});
