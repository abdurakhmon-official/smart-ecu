import { NotFound } from '@tsed/exceptions';

export class NotificationNotFoundException extends NotFound {
  readonly _code = 'NOTIFICATION_NOT_FOUND';

  constructor(notificationId: string) {
    super(`Notification ${notificationId} not found`);
  }
}
