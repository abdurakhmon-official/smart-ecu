import type { ApiResponse } from '@repo/contracts';

export const ok = <T>(data: T, extra?: Omit<ApiResponse<T>, 'success' | 'data'>): ApiResponse<T> => ({
  success: true,
  data,
  ...extra,
});
