'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { AiMessageOutput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { aiAssistantService } from '@/lib/services';

export interface AiChatMessage extends AiMessageOutput {
  pending?: boolean;
}

/**
 * Server tarixi (`react-query`) + hozirgi oqim paytidagi vaqtinchalik xabarlar birlashtiriladi.
 * Oqim tugagach (`onDone`), vaqtinchalik xabarlar server'dan qaytgan haqiqiy yozuvlar bilan
 * almashtiriladi — shu tarzda sahifa yangilanganda ham bir xil tarix ko'rinadi.
 */
export const useAiAssistant = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: queryKeys.aiAssistantMessages,
    queryFn: () => aiAssistantService.history(),
    enabled,
    staleTime: 60_000,
  });

  const [liveMessages, setLiveMessages] = useState<AiChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const messages: AiChatMessage[] = [...(historyQuery.data ?? []), ...liveMessages];

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setErrorCode(null);

      const now = new Date().toISOString();
      const userMessage: AiChatMessage = { id: `local-user-${Date.now()}`, role: 'USER', content: trimmed, createdAt: now };
      const assistantId = `local-assistant-${Date.now()}`;

      setLiveMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'ASSISTANT', content: '', createdAt: now, pending: true },
      ]);
      setIsStreaming(true);

      await aiAssistantService.sendMessage(trimmed, {
        onDelta: (delta) => {
          setLiveMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m)));
        },
        onDone: (saved) => {
          setLiveMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMessage.id));
          queryClient.setQueryData<AiMessageOutput[]>(queryKeys.aiAssistantMessages, (prev) => [
            ...(prev ?? []),
            { id: userMessage.id, role: userMessage.role, content: userMessage.content, createdAt: userMessage.createdAt },
            saved,
          ]);
          setIsStreaming(false);
        },
        onError: (code) => {
          setErrorCode(code ?? 'AI_ASSISTANT_UPSTREAM_ERROR');
          setIsStreaming(false);
          setLiveMessages((prev) => prev.filter((m) => m.id !== assistantId));
        },
      });
    },
    [isStreaming, queryClient],
  );

  const reset = useCallback(async () => {
    await aiAssistantService.reset();
    queryClient.setQueryData(queryKeys.aiAssistantMessages, []);
    setLiveMessages([]);
  }, [queryClient]);

  return {
    messages,
    isLoading: historyQuery.isPending,
    isStreaming,
    errorCode,
    sendMessage,
    reset,
  };
};
