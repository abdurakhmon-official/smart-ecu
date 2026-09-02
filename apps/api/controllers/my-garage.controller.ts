import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Delete, Get, Post, Put } from '@tsed/schema';
import { CreateUserVehicleInputSchema, UpdateUserVehicleInputSchema } from '@/inputs/my-garage.input';
import type { CreateUserVehicleInput, UpdateUserVehicleInput } from '@/inputs/my-garage.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { MyGarageService } from '@/services/my-garage.service';
import { VehicleHealthService } from '@/services/vehicle-health.service';

@Controller('/my-garage')
export class MyGarageController {
  @Inject()
  private myGarageService!: MyGarageService;

  @Inject()
  private vehicleHealthService!: VehicleHealthService;

  @Get('/')
  @Authorized(Authenticate())
  async list() {
    return this.myGarageService.list();
  }

  @Get('/:id/health-score')
  @Authorized(Authenticate())
  async healthScore(@PathParams('id') id: string) {
    return this.vehicleHealthService.getScore(id);
  }

  @Post('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async create(@BodyParams() body: CreateUserVehicleInput) {
    const data = CreateUserVehicleInputSchema.parse(body);
    return this.myGarageService.create(data);
  }

  @Put('/:id')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async update(@PathParams('id') id: string, @BodyParams() body: UpdateUserVehicleInput) {
    const data = UpdateUserVehicleInputSchema.parse(body);
    return this.myGarageService.update(id, data);
  }

  @Delete('/:id')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.write)
  async remove(@PathParams('id') id: string) {
    return this.myGarageService.remove(id);
  }
}
