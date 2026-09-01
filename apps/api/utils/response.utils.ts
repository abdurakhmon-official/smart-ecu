import type { ApiResponse } from '@repo/contracts';

/** `{success:true,data}` konvertini bitta joyda ushlab turadi — servislar shunchaki `ok(data)` qaytaradi. */
export const ok = <T>(data: T, extra?: Omit<ApiResponse<T>, 'success' | 'data'>): ApiResponse<T> => ({
  success: true,
  data,
  ...extra,
});
