import { customAlphabet } from 'nanoid';
import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';

const ISSUER = 'Smart ECU';
const BACKUP_CODE_COUNT = 8;
// 0/1/O/I chetlab o'tildi — qo'lda kiritishda adashtirmaslik uchun.
const generateBackupCodeChunk = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

export const generateTotpSecret = (): string => new Secret({ size: 20 }).base32;

const buildTotp = (email: string, secretBase32: string): TOTP =>
  new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });

export const verifyTotpCode = (email: string, secretBase32: string, code: string): boolean => {
  const totp = buildTotp(email, secretBase32);
  return totp.validate({ token: code.trim(), window: 1 }) !== null;
};

export const buildOtpauthUrl = (email: string, secretBase32: string): string => buildTotp(email, secretBase32).toString();

export const generateQrCodeDataUrl = (email: string, secretBase32: string): Promise<string> => {
  return QRCode.toDataURL(buildOtpauthUrl(email, secretBase32));
};

/** Format: `XXXX-XXXX` — qo'lda ko'chirib yozish uchun o'qilishi oson bo'lgan alifbo bilan. */
export const generateBackupCodes = (count = BACKUP_CODE_COUNT): string[] => {
  return Array.from({ length: count }, () => {
    const raw = generateBackupCodeChunk();
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
};
