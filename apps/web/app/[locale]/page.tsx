import { Bot, Cpu, Gauge, Leaf, MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const QUICK_SERVICES = [
  { key: 'diagnostics', icon: Gauge },
  { key: 'tuning', icon: Cpu },
  { key: 'eco', icon: Leaf },
  { key: 'findService', icon: MapPin },
  { key: 'aiAssistant', icon: Bot },
] as const;

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t('subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/sign-up">
            <Button size="lg">{t('getStarted')}</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              {t('signIn')}
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24">
        <h2 className="mb-5 text-xl font-bold tracking-tight">{t('quickServices.title')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_SERVICES.map(({ key, icon: Icon }) => (
            <Card key={key} className="flex flex-col gap-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{t(`quickServices.${key}.title`)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(`quickServices.${key}.description`)}</p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{t('comingSoonNote')}</p>
      </section>
    </main>
  );
}
