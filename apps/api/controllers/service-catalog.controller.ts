import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Delete, Get, Post, Put } from '@tsed/schema';
import { CreateServiceCatalogItemInputSchema, UpdateServiceCatalogItemInputSchema } from '@/inputs/service-catalog.input';
import type { CreateServiceCatalogItemInput, UpdateServiceCatalogItemInput } from '@/inputs/service-catalog.input';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { ServiceCatalogService } from '@/services/service-catalog.service';

/** O'qish — hamma uchun ochiq (servis kabineti va qidiruv filtri shundan foydalanadi). Yozish — faqat ADMIN. */
@Controller('/service-catalog')
export class ServiceCatalogController {
  @Inject()
  private catalogService!: ServiceCatalogService;

  @Get('/')
  async list() {
    return this.catalogService.list();
  }

  @Post('/')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async create(@BodyParams() body: CreateServiceCatalogItemInput) {
    const data = CreateServiceCatalogItemInputSchema.parse(body);
    return this.catalogService.create(data);
  }

  @Put('/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async update(@PathParams('id') id: string, @BodyParams() body: UpdateServiceCatalogItemInput) {
    const data = UpdateServiceCatalogItemInputSchema.parse(body);
    return this.catalogService.update(id, data);
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async remove(@PathParams('id') id: string) {
    return this.catalogService.remove(id);
  }
}
