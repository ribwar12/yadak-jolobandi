import { apiClient } from "./api-client";

export const productService = {
  getProducts: (filters = {}) => apiClient.get("/products", { params: filters }),
  getProductBySlug: (slug) => apiClient.get(`/products/${encodeURIComponent(slug)}`),
};
