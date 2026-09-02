'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function AdminSubNav() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();

  // add more tabs here as the admin panel grows
  const tabs = [
    { href: '/admin', label: t('dashboard') },
    { href: '/admin/users', label: t('users') },
    { href: '/admin/vehicle-catalog', label: t('vehicleCatalog') },
    { href: '/admin/service-catalog', label: t('serviceCatalog') },
    { href: '/admin/service-providers', label: t('serviceProviders') },
    { href: '/admin/tuners', label: t('tuners') },
    { href: '/admin/orders', label: t('orders') },
    { href: '/admin/payments', label: t('payments') },
    { href: '/admin/reviews', label: t('reviews') },
    { href: '/admin/notifications', label: t('notifications') },
    { href: '/admin/audit-log', label: t('auditLog') },
    { href: '/admin/security', label: t('security') },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            pathname === tab.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
