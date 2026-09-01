'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateServiceProviderInput,
  UpdateServiceProviderInput,
  CreateServiceOfferingInput,
  UpdateServiceOfferingInput,
} from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { myServiceService } from '@/lib/services';

export const useMyService = (enabled = true) => {
  return useQuery({ queryKey: queryKeys.myServiceBase, queryFn: () => myServiceService.getMine(), enabled });
};

export const useApplyAsService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceProviderInput) => myServiceService.apply(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myServiceBase }),
  });
};

export const useUpdateMyService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateServiceProviderInput) => myServiceService.updateMine(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myServiceBase }),
  });
};

export const useAddMyOffering = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceOfferingInput) => myServiceService.addOffering(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myServiceBase }),
  });
};

export const useUpdateMyOffering = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offeringId, input }: { offeringId: string; input: UpdateServiceOfferingInput }) =>
      myServiceService.updateOffering(offeringId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myServiceBase }),
  });
};

export const useRemoveMyOffering = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => myServiceService.removeOffering(offeringId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myServiceBase }),
  });
};
