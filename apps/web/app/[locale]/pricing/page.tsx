import { setRequestLocale } from 'next-intl/server';
import { PricingView } from '@/components/billing/PricingView';

export default async function PricingPage({ params }: PageProps<'/[locale]/pricing'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PricingView />;
}
