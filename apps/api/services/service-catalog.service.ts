import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { ok } from '@/utils/response.utils';
import { serializeServiceCatalogItem } from '@/utils/service-catalog.utils';
import type { CreateServiceCatalogItemInput, UpdateServiceCatalogItemInput } from '@/inputs/service-catalog.input';
import { ServiceCatalogItemNotFoundException } from '@/exceptions/service-catalog.exceptions';

@Injectable()
export class ServiceCatalogService {
  async list() {
    const items = await prisma.serviceCatalogItem.findMany({ orderBy: { slug: 'asc' } });
    return ok(items.map(serializeServiceCatalogItem));
  }

  async create(input: CreateServiceCatalogItemInput) {
    const item = await prisma.serviceCatalogItem.create({ data: input });
    return ok(serializeServiceCatalogItem(item));
  }

  async update(itemId: string, input: UpdateServiceCatalogItemInput) {
    await this.getOrThrow(itemId);
    const item = await prisma.serviceCatalogItem.update({ where: { id: itemId }, data: input });
    return ok(serializeServiceCatalogItem(item));
  }

  async remove(itemId: string) {
    await this.getOrThrow(itemId);
    await prisma.serviceCatalogItem.delete({ where: { id: itemId } });
    return ok(null);
  }

  private async getOrThrow(itemId: string) {
    const item = await prisma.serviceCatalogItem.findUnique({ where: { id: itemId } });
    if (!item) throw new ServiceCatalogItemNotFoundException(itemId);
    return item;
  }
}
