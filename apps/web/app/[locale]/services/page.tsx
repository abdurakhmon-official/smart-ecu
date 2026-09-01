import { setRequestLocale } from 'next-intl/server';
import { ServiceDirectoryView } from '@/components/services/ServiceDirectoryView';

export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ServiceDirectoryView />;
}
