'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateServiceCatalogItemInput, UpdateServiceCatalogItemInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { serviceCatalogService } from '@/lib/services';

export const useServiceCatalog = () => {
  return useQuery({ queryKey: queryKeys.serviceCatalog, queryFn: () => serviceCatalogService.list() });
};

export const useCreateServiceCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceCatalogItemInput) => serviceCatalogService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceCatalog }),
  });
};

export const useUpdateServiceCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateServiceCatalogItemInput }) =>
      serviceCatalogService.update(itemId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceCatalog }),
  });
};

export const useDeleteServiceCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => serviceCatalogService.delete(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceCatalog }),
  });
};
