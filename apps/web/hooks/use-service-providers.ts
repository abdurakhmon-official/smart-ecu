'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminServiceProviderQuery, ServiceProviderQuery } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { serviceProviderService } from '@/lib/services';

export const useServiceProviders = (query: Partial<ServiceProviderQuery> = {}) => {
  return useQuery({
    queryKey: queryKeys.serviceProviders(query),
    queryFn: () => serviceProviderService.list(query),
  });
};

export const useServiceProvider = (id: string) => {
  return useQuery({
    queryKey: queryKeys.serviceProvider(id),
    queryFn: () => serviceProviderService.get(id),
  });
};

export const useAdminServiceProviders = (query: Partial<AdminServiceProviderQuery> = {}) => {
  return useQuery({
    queryKey: queryKeys.adminServiceProviders(query),
    queryFn: () => serviceProviderService.adminList(query),
  });
};

export const useVerifyServiceProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceProviderService.verify(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminServiceProvidersBase }),
  });
};

export const useSuspendServiceProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceProviderService.suspend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminServiceProvidersBase }),
  });
};
