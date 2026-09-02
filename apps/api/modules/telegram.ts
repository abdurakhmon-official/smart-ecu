import config from '@/config';

const API_BASE = 'https://api.telegram.org';

export const isTelegramConfigured = (): boolean => Boolean(config.telegram.botToken);

/** `botToken` bo'sh bo'lsa hech narsa qilmaydi — Anthropic/S3 kabi, kalit kelgach o'zi ishga tushadi. */
export const sendTelegramMessage = async (chatId: string, text: string): Promise<void> => {
  if (!isTelegramConfigured()) return;

  try {
    await fetch(`${API_BASE}/bot${config.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (error) {
    console.warn(`[telegram] failed to send message: ${(error as Error).message}`);
  }
};

export const telegramDeepLink = (code: string): string => `https://t.me/${config.telegram.botUsername}?start=${code}`;
