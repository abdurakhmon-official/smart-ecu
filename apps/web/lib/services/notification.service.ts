import type { NotificationOutput, NotificationQuery } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

class NotificationService extends BaseService<NotificationOutput, never, never> {
  protected BASE_PATH = 'notifications';

  async list(query: Partial<NotificationQuery> = {}): Promise<Paged<NotificationOutput>> {
    return this.sendGetPaged<NotificationOutput>('', query);
  }

  async unreadCount() {
    return this.sendGet<{ count: number }>('/unread-count');
  }

  async markRead(id: string) {
    return this.sendPut<NotificationOutput>(`/${id}/read`, {});
  }

  async markAllRead() {
    return this.sendPut<null>('/read-all', {});
  }
}

export const notificationService = new NotificationService();
