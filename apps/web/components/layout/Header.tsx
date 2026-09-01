'use client';

import { ChevronDown, LayoutGrid, LogOut, MapPin, Menu, Shield, Store, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useSession, useSignOut } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

/**
 * Ba'zi yo'nalishlar (Xizmatlar, Yangiliklar, Aloqa) hali qurilmagan — keyingi
 * bosqichlarda real sahifa bilan almashtiriladi. Hozircha vizual joy egallovchi
 * sifatida ko'rsatiladi, shuning uchun `href: null`.
 */
type NavLinkKey = 'home' | 'services' | 'workshops' | 'aiAssistant' | 'myGarage' | 'orders' | 'news' | 'contact';

const NAV_LINKS: { key: NavLinkKey; href: '/' | '/my-garage' | '/services' | '/my-orders' | '/ai-assistant' | null }[] = [
  { key: 'home', href: '/' },
  { key: 'services', href: null },
  { key: 'workshops', href: '/services' },
  { key: 'aiAssistant', href: '/ai-assistant' },
  { key: 'myGarage', href: '/my-garage' },
  { key: 'orders', href: '/my-orders' },
  { key: 'news', href: null },
  { key: 'contact', href: null },
];

export function Header() {
  const t = useTranslations('nav');
  const { user, isAuthenticated } = useSession();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const initials = (user?.fullName ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight" onClick={closeMenu}>
          <span className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] bg-primary">
            <LayoutGrid className="size-4.5 text-primary-foreground" />
          </span>
          <span className="truncate">{t('brand')}</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {NAV_LINKS.map(({ key, href }) =>
            href ? (
              <Link
                key={key}
                href={href}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {t(`links.${key}`)}
              </Link>
            ) : (
              <span
                key={key}
                aria-disabled
                title={t('comingSoon')}
                className="shrink-0 cursor-default rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60"
              >
                {t(`links.${key}`)}
              </span>
            ),
          )}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <MapPin className="size-4" />
                Toshkent
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('location')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Toshkent</DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {t('comingSoon')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && <NotificationBell />}

          <LanguageSwitcher />
          <ThemeToggle />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar>
                    <AvatarFallback>{initials || '?'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">{user?.fullName}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-service" className="flex items-center gap-2">
                    <Store className="size-4" />
                    {t('myService')}
                  </Link>
                </DropdownMenuItem>
                {isPrivileged && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="size-4" />
                      {t('admin')}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => signOut()} className="flex items-center gap-2 text-destructive">
                  <LogOut className="size-4" />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  {t('signIn')}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">{t('signUp')}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="size-9 px-0"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ key, href }) =>
              href ? (
                <Link key={key} href={href} onClick={closeMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    {t(`links.${key}`)}
                  </Button>
                </Link>
              ) : (
                <span
                  key={key}
                  aria-disabled
                  className={cn('flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground/60')}
                >
                  {t(`links.${key}`)} · {t('comingSoon')}
                </span>
              ),
            )}
          </nav>

          {isAuthenticated ? (
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <Link href="/my-service" onClick={closeMenu}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {t('myService')}
                </Button>
              </Link>
              {isPrivileged && (
                <Link href="/admin" onClick={closeMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    {t('admin')}
                  </Button>
                </Link>
              )}
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    closeMenu();
                    signOut();
                  }}
                >
                  {t('signOut')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <Link href="/sign-in" onClick={closeMenu}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {t('signIn')}
                </Button>
              </Link>
              <Link href="/sign-up" onClick={closeMenu}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {t('signUp')}
                </Button>
              </Link>
              <LanguageSwitcher />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
