import { NotFound } from '@tsed/exceptions';

export class UserVehicleNotFoundException extends NotFound {
  readonly _code = 'USER_VEHICLE_NOT_FOUND';

  constructor(vehicleId: string) {
    super(`Vehicle ${vehicleId} not found`);
  }
}
