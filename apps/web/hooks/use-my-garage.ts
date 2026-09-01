'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateUserVehicleInput, UpdateUserVehicleInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { myGarageService } from '@/lib/services';

export const useMyVehicles = (enabled = true) => {
  return useQuery({ queryKey: queryKeys.myGarageBase, queryFn: () => myGarageService.list(), enabled });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserVehicleInput) => myGarageService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myGarageBase }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, input }: { vehicleId: string; input: UpdateUserVehicleInput }) =>
      myGarageService.update(vehicleId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myGarageBase }),
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: string) => myGarageService.delete(vehicleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myGarageBase }),
  });
};
