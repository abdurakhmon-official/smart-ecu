import { setRequestLocale } from 'next-intl/server';
import { ReportAnalyzerView } from '@/components/report-analyzer/ReportAnalyzerView';

export default async function ReportAnalyzerPage({ params }: PageProps<'/[locale]/report-analyzer'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReportAnalyzerView />;
}
