"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { productService } from "@/services/product.service";

export function useProducts(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
    ...options,
  });
}

export function useProductDetail(slug, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => productService.getProductBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
}
