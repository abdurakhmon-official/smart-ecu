'use client';

import { useTranslations } from 'next-intl';
import { AiAssistantChat } from '@/components/ai-assistant/AiAssistantChat';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/use-auth';
import { Link } from '@/i18n/navigation';

export function AiAssistantView() {
  const t = useTranslations('aiAssistant');
  const tNav = useTranslations('nav');
  const { isAuthenticated, loading: sessionLoading } = useSession();

  if (!sessionLoading && !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
        <Link href="/sign-in">
          <Button>{tNav('signIn')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <AiAssistantChat />
    </div>
  );
}
