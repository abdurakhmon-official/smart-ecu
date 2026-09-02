import { USER_ROLE } from '../generated/prisma';

export const DEFAULT_PAGE_SIZE = 10;

export const BCRYPT_SALT_ROUNDS = 10;

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const UPLOAD_FOLDERS = ['avatar', 'document', 'ecu-file'] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_ECU_FILE_UPLOAD_BYTES = 50 * 1024 * 1024;

export const MAX_UPLOAD_BYTES_BY_FOLDER: Record<UploadFolder, number> = {
  avatar: MAX_UPLOAD_BYTES,
  document: MAX_UPLOAD_BYTES,
  'ecu-file': MAX_ECU_FILE_UPLOAD_BYTES,
};

/**
 * `ecu-file` ham shu ro'yxatda — lekin "o'qish uchun ochiq" degani emas: haqiqiy
 * ruxsat tekshiruvi `EcuFileService`da (buyurtma egasi/tuner ekanini tekshirib,
 * faqat o'ziga tegishli kalitni qaytaradi) sodir bo'ladi. `AwsController.sign()`
 * o'zi hech qanday egalik tekshiruvi qilmaydi (`avatar`/`document` uchun ham xuddi
 * shunday) — himoya kalitning o'zi `uuid()` bilan taxmin qilib bo'lmasligidan keladi.
 */
export const READABLE_ASSET_FOLDERS = ['avatar', 'document', 'ecu-file'] as const;

export type ReadableAssetFolder = (typeof READABLE_ASSET_FOLDERS)[number];

export const UPLOAD_MIME_TYPES: Record<string, 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'ARCHIVE' | 'BINARY'> = {
  'image/png': 'IMAGE',
  'image/jpeg': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/avif': 'IMAGE',
  'application/pdf': 'DOCUMENT',
  'text/plain': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'application/zip': 'ARCHIVE',
  'application/x-zip-compressed': 'ARCHIVE',
  // ECU proshivka fayllari (.bin va sh.k.) — sotuvchiga xos formatlar, umumiy magic byte'ga ega emas.
  'application/octet-stream': 'BINARY',
};

export const ALLOWED_MIME_BY_FOLDER: Record<UploadFolder, readonly string[]> = {
  avatar: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
  ],
  'ecu-file': ['application/octet-stream', 'application/zip', 'application/x-zip-compressed'],
};

export const USER_PUBLIC_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  phone: true,
  avatar: true,
  locale: true,
  emailVerified: true,
  passwordChangedAt: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  twoFactorEnabledAt: true,
  telegramChatId: true,
};

export type RoleRequirements = {
  role: USER_ROLE | null;
};
