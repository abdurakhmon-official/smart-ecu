import type { MessageCode } from './message-codes';

export const uz: Record<MessageCode, string> = {
  AUTH_EMAIL_TAKEN: "Bu email allaqachon ro'yxatdan o'tgan",
  AUTH_INVALID_CREDENTIALS: "Email yoki parol noto'g'ri",
  AUTH_ACCOUNT_INACTIVE: 'Bu hisob faol emas',
  AUTH_USER_NOT_FOUND: 'Foydalanuvchi topilmadi',
  AUTH_UNAUTHORIZED: 'Ruxsat berilmagan',
  AUTH_SIGNED_UP: "Muvaffaqiyatli ro'yxatdan o'tildi",
  AUTH_SIGNED_OUT: 'Tizimdan chiqildi',
  VALIDATION_PASSWORD_SHORT: 'Parol juda qisqa',
  VALIDATION_PASSWORD_LONG: 'Parol juda uzun',
  VALIDATION_PASSWORD_PERSONAL: "Parolda ismingiz yoki emailingiz bo'lmasligi kerak",
  VALIDATION_FAILED: 'Tekshiruv muvaffaqiyatsiz',
  RATE_LIMITED: "So'rovlar juda ko'p, biroz kuting",
  UPLOAD_MIME_NOT_ALLOWED_FOR_FOLDER: 'Bu fayl turi ushbu papka uchun ruxsat etilmagan',
  ADMIN_CANNOT_MODIFY_SELF: "O'zingizning hisobingiz rolini yoki faollik holatini o'zgartira olmaysiz",
  VEHICLE_CATALOG_BRAND_NOT_FOUND: 'Brend topilmadi',
  VEHICLE_CATALOG_MODEL_NOT_FOUND: 'Model topilmadi',
  VEHICLE_CATALOG_GENERATION_NOT_FOUND: 'Generatsiya topilmadi',
  VEHICLE_CATALOG_ENGINE_OPTION_NOT_FOUND: 'Motor varianti topilmadi',
  USER_VEHICLE_NOT_FOUND: 'Avtomobil topilmadi',
};
