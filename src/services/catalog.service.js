import { apiClient } from "./api-client";

export const catalogService = {
  getCars: () => apiClient.get("/catalog/cars"),
  getCategories: () => apiClient.get("/catalog/categories"),
  getBrands: () => apiClient.get("/catalog/brands"),
  getProvinces: () => apiClient.get("/catalog/provinces"),
};
