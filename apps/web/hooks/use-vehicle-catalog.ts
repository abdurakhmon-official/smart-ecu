'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBrandInput,
  UpdateBrandInput,
  CreateModelInput,
  UpdateModelInput,
  CreateGenerationInput,
  UpdateGenerationInput,
  CreateEngineOptionInput,
  UpdateEngineOptionInput,
} from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { vehicleCatalogService } from '@/lib/services';

// ── reads ────────────────────────────────────────────────────────────────

export const useBrands = () => {
  return useQuery({ queryKey: queryKeys.brands, queryFn: () => vehicleCatalogService.listBrands() });
};

export const useModels = (brandId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.models(brandId),
    queryFn: () => vehicleCatalogService.listModels(brandId as string),
    enabled: Boolean(brandId),
  });
};

export const useGenerations = (modelId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.generations(modelId),
    queryFn: () => vehicleCatalogService.listGenerations(modelId as string),
    enabled: Boolean(modelId),
  });
};

export const useEngineOptions = (generationId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.engineOptions(generationId),
    queryFn: () => vehicleCatalogService.listEngineOptions(generationId as string),
    enabled: Boolean(generationId),
  });
};

// ── admin mutations ──────────────────────────────────────────────────────

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBrandInput) => vehicleCatalogService.createBrand(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.brands }),
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brandId, input }: { brandId: string; input: UpdateBrandInput }) =>
      vehicleCatalogService.updateBrand(brandId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.brands }),
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brandId: string) => vehicleCatalogService.deleteBrand(brandId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.brands }),
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateModelInput) => vehicleCatalogService.createModel(input),
    onSuccess: (_, input) => queryClient.invalidateQueries({ queryKey: queryKeys.models(input.brandId) }),
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ modelId, input }: { modelId: string; input: UpdateModelInput }) =>
      vehicleCatalogService.updateModel(modelId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.modelsBase }),
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => vehicleCatalogService.deleteModel(modelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.modelsBase }),
  });
};

export const useCreateGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGenerationInput) => vehicleCatalogService.createGeneration(input),
    onSuccess: (_, input) => queryClient.invalidateQueries({ queryKey: queryKeys.generations(input.modelId) }),
  });
};

export const useUpdateGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ generationId, input }: { generationId: string; input: UpdateGenerationInput }) =>
      vehicleCatalogService.updateGeneration(generationId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.generationsBase }),
  });
};

export const useDeleteGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (generationId: string) => vehicleCatalogService.deleteGeneration(generationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.generationsBase }),
  });
};

export const useCreateEngineOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEngineOptionInput) => vehicleCatalogService.createEngineOption(input),
    onSuccess: (_, input) => queryClient.invalidateQueries({ queryKey: queryKeys.engineOptions(input.generationId) }),
  });
};

export const useUpdateEngineOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ engineOptionId, input }: { engineOptionId: string; input: UpdateEngineOptionInput }) =>
      vehicleCatalogService.updateEngineOption(engineOptionId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.engineOptionsBase }),
  });
};

export const useDeleteEngineOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (engineOptionId: string) => vehicleCatalogService.deleteEngineOption(engineOptionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.engineOptionsBase }),
  });
};
