// interfaces (read-only computed endpoint — no input schema)

/**
 * `label` — oldindan ma'lum, yopiq to'plam (frontend shu bo'yicha tarjima qiladi),
 * "server matn qaytarmaydi" qoidasiga mos. Formula v1 — keyinroq sozlanishi mumkin.
 */
export type VehicleHealthFactorLabel = 'VEHICLE_AGE' | 'HIGH_MILEAGE' | 'RECENT_MAINTENANCE' | 'NO_SERVICE_HISTORY';

export interface VehicleHealthFactor {
  label: VehicleHealthFactorLabel;
  delta: number;
}

export interface VehicleHealthScoreOutput {
  score: number;
  factors: VehicleHealthFactor[];
}
