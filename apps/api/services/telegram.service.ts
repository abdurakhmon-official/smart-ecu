import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { isRedisReady, redis } from '@/modules/redis';
import { nanoid } from '@/modules/nanoid';
import { sendTelegramMessage, telegramDeepLink } from '@/modules/telegram';
import { requireUserId } from '@/utils/errors.utils';
import { ok } from '@/utils/response.utils';
import type { LocalizedText } from '@repo/contracts';

// types

interface TelegramWebhookUpdate {
  message?: {
    chat?: { id: number };
    text?: string;
  };
}

type Locale = 'uz' | 'ru' | 'en';

const NOTIFICATION_MESSAGES: Record<string, Record<Locale, string>> = {
  ORDER_RECEIVED: { uz: '🔧 Yangi buyurtma keldi.', ru: '🔧 Получен новый заказ.', en: '🔧 New order received.' },
  ORDER_ACCEPTED: { uz: '✅ Buyurtmangiz qabul qilindi.', ru: '✅ Ваш заказ принят.', en: '✅ Your order was accepted.' },
  ORDER_COMPLETED: { uz: '🎉 Buyurtmangiz yakunlandi.', ru: '🎉 Ваш заказ завершён.', en: '🎉 Your order was completed.' },
  ORDER_CANCELLED: { uz: '❌ Buyurtma bekor qilindi.', ru: '❌ Заказ отменён.', en: '❌ Order cancelled.' },
  REVIEW_RECEIVED: { uz: '⭐ Sizga yangi sharh qoldirildi.', ru: '⭐ Вы получили новый отзыв.', en: '⭐ You received a new review.' },
  TUNING_ORDER_RECEIVED: { uz: '🔧 Yangi tuning buyurtmasi keldi.', ru: '🔧 Новый заказ на тюнинг.', en: '🔧 New tuning order received.' },
  TUNING_ORDER_STATUS_CHANGED: {
    uz: "🔄 Tuning buyurtmangiz holati o'zgardi.",
    ru: '🔄 Статус заказа на тюнинг изменился.',
    en: '🔄 Your tuning order status changed.',
  },
};

const LINK_CONFIRMED_MESSAGE: Record<Locale, string> = {
  uz: "✅ Hisobingiz Smart ECU bilan bog'landi. Endi shu yerda bildirishnomalar olasiz.",
  ru: '✅ Ваш аккаунт привязан к Smart ECU. Теперь вы будете получать уведомления здесь.',
  en: "✅ Your account is linked to Smart ECU. You'll now receive notifications here.",
};

@Injectable()
export class TelegramService {
  private static readonly LINK_CODE_PREFIX = 'tg-link:';
  private static readonly LINK_CODE_TTL_SECONDS = 10 * 60;

  @InjectContext()
  private context!: PlatformContext;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async createLinkCode() {
    const code = nanoid();

    if (isRedisReady()) {
      try {
        await redis.set(TelegramService.LINK_CODE_PREFIX + code, this.currentUserId, 'EX', TelegramService.LINK_CODE_TTL_SECONDS);
      } catch {
        // Redis ishlamasa bog'lash vaqtincha ishlamaydi — kam-tavakkalli, ikkinchi darajali funksiya, mahalliy fallback shart emas.
      }
    }

    return ok({ code, deepLink: telegramDeepLink(code) });
  }

  async unlink() {
    await prisma.user.update({ where: { id: this.currentUserId }, data: { telegramChatId: null } });
    return ok(null);
  }

  /** Telegram'ning o'zi webhook orqali chaqiradi — controller'ga bevosita ochilmagan. */
  async handleWebhookUpdate(update: TelegramWebhookUpdate): Promise<void> {
    const chatId = update.message?.chat?.id;
    const text = update.message?.text ?? '';
    if (!chatId || !text.startsWith('/start ')) return;

    const code = text.slice('/start '.length).trim();
    if (!code) return;

    let userId: string | null = null;
    if (isRedisReady()) {
      try {
        userId = await redis.get(TelegramService.LINK_CODE_PREFIX + code);
        if (userId) await redis.del(TelegramService.LINK_CODE_PREFIX + code);
      } catch {
        // Redis ishlamasa bog'lash muvaffaqiyatsiz tugaydi — foydalanuvchi qaytadan kod so'raydi.
      }
    }

    if (!userId) return;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { telegramChatId: String(chatId) },
      select: { locale: true },
    });

    await sendTelegramMessage(String(chatId), TelegramService.resolveMessage(LINK_CONFIRMED_MESSAGE, user.locale));
  }

  /** `NotificationService.create()` chaqiradi — bildirishnoma yaratilganda parallel ravishda. */
  async notify(userId: string, type: string): Promise<void> {
    const template = NOTIFICATION_MESSAGES[type];
    if (!template) return;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramChatId: true, locale: true } });
    if (!user?.telegramChatId) return;

    await sendTelegramMessage(user.telegramChatId, TelegramService.resolveMessage(template, user.locale));
  }

  /** `NotificationService.broadcast()` chaqiradi — admin e'loni uchun. */
  async notifyBroadcast(userId: string, message: LocalizedText): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramChatId: true, locale: true } });
    if (!user?.telegramChatId) return;

    await sendTelegramMessage(user.telegramChatId, TelegramService.resolveMessage(message, user.locale));
  }

  private static resolveMessage(template: Record<Locale, string>, locale: string): string {
    return template[locale as Locale] ?? template.uz;
  }
}
