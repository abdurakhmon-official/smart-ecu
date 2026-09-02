import { z } from 'zod';

// schemas

export const EcuFileKindSchema = z.enum(['ORIGINAL', 'MODIFIED', 'LOG']);

export const CreateEcuFileInputSchema = z.object({
  kind: EcuFileKindSchema,
  storageKey: z.string().min(1),
  originalName: z.string().min(1).max(255),
  ecuId: z.string().max(120).optional(),
  software: z.string().max(120).optional(),
  hardware: z.string().max(120).optional(),
  checksum: z.string().max(200).optional(),
});

// types

export type EcuFileKind = z.infer<typeof EcuFileKindSchema>;
export type CreateEcuFileInput = z.infer<typeof CreateEcuFileInputSchema>;

// interfaces

export interface EcuFileOutput {
  id: string;
  tuningOrderId: string;
  kind: EcuFileKind;
  storageKey: string;
  originalName: string;
  ecuId: string | null;
  software: string | null;
  hardware: string | null;
  checksum: string | null;
  uploadedById: string;
  createdAt: string;
}
