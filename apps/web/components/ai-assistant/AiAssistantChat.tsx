'use client';

import { Bot, RotateCcw, Send, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { useAiAssistant } from '@/hooks/use-ai-assistant';
import { cn } from '@/lib/utils';

const QUICK_QUESTION_KEYS = ['checkEngine', 'vibration', 'coldStart', 'fuelConsumption'] as const;

export function AiAssistantChat() {
  const t = useTranslations('aiAssistant');
  const tServer = useTranslations('serverMessages');
  const { messages, isLoading, isStreaming, errorCode, sendMessage, reset } = useAiAssistant(true);
  const [draft, setDraft] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);

  const submit = (text: string) => {
    if (!text.trim() || isStreaming) return;
    setDraft('');
    void sendMessage(text);
  };

  return (
    <div className="flex h-[70vh] min-h-120 flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="font-semibold">{t('title')}</h2>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(true)} disabled={messages.length === 0}>
          <RotateCcw className="size-3.5" />
          {t('newChat')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_QUESTION_KEYS.map((key) => (
                <Button key={key} variant="outline" size="sm" onClick={() => submit(t(`quickQuestions.${key}`))}>
                  {t(`quickQuestions.${key}`)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex items-start gap-2.5', message.role === 'USER' && 'flex-row-reverse')}>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full',
                  message.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground',
                )}
              >
                {message.role === 'USER' ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </span>
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap',
                  message.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground',
                )}
              >
                {message.content || (message.pending ? t('thinking') : '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorCode && <p className="border-t border-border px-4 py-2 text-xs text-destructive">{tServer(errorCode)}</p>}

      <div className="border-t border-border p-3">
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit(draft);
              }
            }}
            placeholder={t('placeholder')}
            className="min-h-11 flex-1 resize-none py-2.5"
            rows={1}
          />
          <Button type="submit" disabled={!draft.trim() || isStreaming} className="shrink-0">
            <Send className="size-4" />
          </Button>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">{t('disclaimer')}</p>
      </div>

      <Dialog open={confirmingReset} onOpenChange={setConfirmingReset}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('newChat')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('newChatConfirm')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingReset(false)}>
              {t('cancel')}
            </Button>
            <Button
              className="bg-destructive text-white hover:opacity-90"
              onClick={() => {
                void reset();
                setConfirmingReset(false);
              }}
            >
              {t('confirmNewChat')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
