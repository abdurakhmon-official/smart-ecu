import { z } from 'zod';

// schemas

export const ReportSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const AnalyzeReportInputSchema = z.object({
  storageKey: z.string().min(1),
});

// types

export type ReportSeverity = z.infer<typeof ReportSeveritySchema>;
export type AnalyzeReportInput = z.infer<typeof AnalyzeReportInputSchema>;

// interfaces

export interface ServiceReportAnalysisOutput {
  id: string;
  storageKey: string;
  severity: ReportSeverity | null;
  summary: string | null;
  createdAt: string;
}
