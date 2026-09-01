import { setRequestLocale } from 'next-intl/server';
import { AiAssistantView } from '@/components/ai-assistant/AiAssistantView';

export default async function AiAssistantPage({ params }: PageProps<'/[locale]/ai-assistant'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AiAssistantView />;
}
