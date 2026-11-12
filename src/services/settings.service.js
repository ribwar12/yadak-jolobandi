import { apiClient } from "./api-client";

export const settingsService = {
  getSettings: () => apiClient.get("/settings"),
  updateSettings: (payload) => apiClient.patch("/settings", payload),
};
