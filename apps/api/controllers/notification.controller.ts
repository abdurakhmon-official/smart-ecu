import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Put } from '@tsed/schema';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { NotificationService } from '@/services/notification.service';

@Controller('/notifications')
export class NotificationController {
  @Inject()
  private notificationService!: NotificationService;

  @Get('/')
  @Authorized(Authenticate())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.notificationService.list(query);
  }

  @Get('/unread-count')
  @Authorized(Authenticate())
  async unreadCount() {
    return this.notificationService.unreadCount();
  }

  @Put('/read-all')
  @Authorized(Authenticate())
  async markAllRead() {
    return this.notificationService.markAllRead();
  }

  @Put('/:id/read')
  @Authorized(Authenticate())
  async markRead(@PathParams('id') id: string) {
    return this.notificationService.markRead(id);
  }
}
