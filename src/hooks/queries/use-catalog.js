"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { catalogService } from "@/services/catalog.service";

export function useCars() {
  return useQuery({
    queryKey: queryKeys.catalog.cars,
    queryFn: () => catalogService.getCars(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: () => catalogService.getCategories(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.catalog.brands,
    queryFn: () => catalogService.getBrands(),
  });
}

export function useProvinces() {
  return useQuery({
    queryKey: queryKeys.catalog.provinces,
    queryFn: () => catalogService.getProvinces(),
    staleTime: Infinity,
  });
}
