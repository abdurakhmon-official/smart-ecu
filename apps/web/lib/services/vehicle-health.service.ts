import type { ApiResponse, VehicleHealthScoreOutput } from '@repo/contracts';
import api from '@/lib/axios';

class VehicleHealthService {
  async getScore(vehicleId: string): Promise<VehicleHealthScoreOutput> {
    const { data } = await api.get<ApiResponse<VehicleHealthScoreOutput>>(`/my-garage/${vehicleId}/health-score`);
    return data.data;
  }
}

export const vehicleHealthService = new VehicleHealthService();
