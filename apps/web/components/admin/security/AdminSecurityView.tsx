'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TwoFactorDisableFlow } from '@/components/admin/security/TwoFactorDisableFlow';
import { TwoFactorEnableFlow } from '@/components/admin/security/TwoFactorEnableFlow';
import { useSession } from '@/hooks/use-auth';

export function AdminSecurityView() {
  const t = useTranslations('admin.security');
  const { user } = useSession();

  if (!user) return null;

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t('twoFactorTitle')}</CardTitle>
          <Badge variant={user.twoFactorEnabled ? 'success' : 'warning'}>{user.twoFactorEnabled ? t('enabled') : t('disabled')}</Badge>
        </CardHeader>
        <CardContent>{user.twoFactorEnabled ? <TwoFactorDisableFlow /> : <TwoFactorEnableFlow />}</CardContent>
      </Card>
    </div>
  );
}
