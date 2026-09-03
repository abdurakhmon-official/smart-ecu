import { z } from 'zod';

// schemas

export const TwoFactorCodeInputSchema = z.object({ code: z.string().trim().min(6).max(9) });

export const TwoFactorVerifyInputSchema = z.object({
  mfaToken: z.string().min(1),
  code: z.string().trim().min(6).max(9),
});

// types

export type TwoFactorCodeInput = z.infer<typeof TwoFactorCodeInputSchema>;
export type TwoFactorVerifyInput = z.infer<typeof TwoFactorVerifyInputSchema>;

// interfaces

export interface TwoFactorSetupOutput {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorEnableOutput {
  backupCodes: string[];
}

export interface SigninMfaRequiredOutput {
  mfaRequired: true;
  mfaToken: string;
}

export interface SigninTokenOutput {
  mfaRequired: false;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export type SigninOutput = SigninTokenOutput | SigninMfaRequiredOutput;
