import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Post, Put } from '@tsed/schema';
import type { BroadcastNotificationInput } from '@/inputs/notification.input';
import { BroadcastNotificationInputSchema } from '@/inputs/notification.input';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
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

  @Post('/broadcast')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.adminHeavy)
  async broadcast(@BodyParams() body: BroadcastNotificationInput) {
    const data = BroadcastNotificationInputSchema.parse(body);
    return this.notificationService.broadcast(data);
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
