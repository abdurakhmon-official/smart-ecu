'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { InitiatePaymentInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { subscriptionService } from '@/lib/services';

export const useSubscriptionPlans = () => {
  return useQuery({ queryKey: queryKeys.subscriptionPlans, queryFn: () => subscriptionService.plans() });
};

export const useMySubscription = (enabled = true) => {
  return useQuery({ queryKey: queryKeys.mySubscription, queryFn: () => subscriptionService.getMine(), enabled });
};

export const useMyPayments = (enabled = true) => {
  return useQuery({ queryKey: queryKeys.myPayments, queryFn: () => subscriptionService.myPayments(), enabled });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: (input: InitiatePaymentInput) => subscriptionService.checkout(input),
  });
};
