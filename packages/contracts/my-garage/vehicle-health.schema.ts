// interfaces (read-only computed endpoint — no input schema)

export type VehicleHealthFactorLabel = 'VEHICLE_AGE' | 'HIGH_MILEAGE' | 'RECENT_MAINTENANCE' | 'NO_SERVICE_HISTORY';

export interface VehicleHealthFactor {
  label: VehicleHealthFactorLabel;
  delta: number;
}

export interface VehicleHealthScoreOutput {
  score: number;
  factors: VehicleHealthFactor[];
}
