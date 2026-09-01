import { z } from 'zod';

// schemas

export const AiMessageRoleSchema = z.enum(['USER', 'ASSISTANT']);

export const SendAiMessageInputSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

// types

export type AiMessageRole = z.infer<typeof AiMessageRoleSchema>;
export type SendAiMessageInput = z.infer<typeof SendAiMessageInputSchema>;

// interfaces

export interface AiMessageOutput {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}
