'use client';

import { Check, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

const LABELS: Record<string, string> = { uz: "O'zbekcha", ru: 'Русский', en: 'English' };

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" aria-label="Language">
          <Globe className="size-4" />
          {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((code) => (
          <DropdownMenuItem
            key={code}
            className="flex items-center justify-between gap-2"
            onSelect={() =>
              router.replace(
                // @ts-expect-error -- pathname is dynamically typed by next-intl per route
                { pathname, params },
                { locale: code },
              )
            }
          >
            {LABELS[code] ?? code}
            {code === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
