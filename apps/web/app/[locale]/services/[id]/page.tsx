import { setRequestLocale } from 'next-intl/server';
import { ServiceProfileView } from '@/components/services/ServiceProfileView';

export default async function ServiceProfilePage({ params }: PageProps<'/[locale]/services/[id]'>) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ServiceProfileView id={id} />;
}
