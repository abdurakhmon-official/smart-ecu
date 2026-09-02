'use client';

import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { useAnalyzeReport, useReportAnalyses } from '@/hooks/use-service-report-analysis';
import { useUpload } from '@/hooks/use-upload';
import { Link } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';

const SEVERITY_BADGE_VARIANT = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger' } as const;

export function ReportAnalyzerView() {
  const t = useTranslations('reportAnalyzer');
  const { isAuthenticated, loading } = useSession();
  const { data: analyses } = useReportAnalyses(isAuthenticated);
  const upload = useUpload();
  const analyze = useAnalyzeReport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
        <Link href="/sign-in">
          <Button>{t('signIn')}</Button>
        </Link>
      </div>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    try {
      const { key } = await upload.mutateAsync({ folder: 'document', file });
      await analyze.mutateAsync({ storageKey: key });
    } catch (err) {
      setError(errorFrom(err).message);
    }
  };

  const busy = upload.isPending || analyze.isPending;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelect} />
      <Button onClick={() => fileInputRef.current?.click()} disabled={busy} className="self-start">
        <Upload className="size-4" />
        {busy ? t('analyzing') : t('uploadReport')}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3">
        {!analyses?.length ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          analyses.map((analysis) => (
            <Card key={analysis.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                {analysis.severity ? (
                  <Badge variant={SEVERITY_BADGE_VARIANT[analysis.severity]}>{t(`severity.${analysis.severity}`)}</Badge>
                ) : (
                  <Badge>{t('severity.UNKNOWN')}</Badge>
                )}
                <span className="text-xs text-muted-foreground">{new Date(analysis.createdAt).toLocaleString()}</span>
              </div>
              {analysis.summary && <p className="text-sm">{analysis.summary}</p>}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
