'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnalyzeReportInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { serviceReportAnalysisService } from '@/lib/services';

export const useReportAnalyses = (enabled = true) => {
  return useQuery({ queryKey: queryKeys.reportAnalysesBase, queryFn: () => serviceReportAnalysisService.list(), enabled });
};

export const useAnalyzeReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnalyzeReportInput) => serviceReportAnalysisService.analyze(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reportAnalysesBase }),
  });
};
