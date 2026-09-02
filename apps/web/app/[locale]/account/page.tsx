import { setRequestLocale } from 'next-intl/server';
import { AccountView } from '@/components/account/AccountView';

export default async function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AccountView />;
}
