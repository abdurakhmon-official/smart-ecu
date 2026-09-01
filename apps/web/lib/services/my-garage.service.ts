import type { UserVehicleOutput, CreateUserVehicleInput, UpdateUserVehicleInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

class MyGarageService extends BaseService<UserVehicleOutput, CreateUserVehicleInput, UpdateUserVehicleInput> {
  protected BASE_PATH = 'my-garage';

  async list() {
    return this.sendGet<UserVehicleOutput[]>('');
  }
}

export const myGarageService = new MyGarageService();
