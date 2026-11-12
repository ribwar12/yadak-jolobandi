import { apiClient } from "./api-client";

export const authService = {
  requestOtp: (payload) => apiClient.post("/auth/otp/request", payload),
  verifyOtp: (payload) => apiClient.post("/auth/otp/verify", payload),
  getProfile: () => apiClient.get("/me"),
  updateProfile: (payload) => apiClient.patch("/me", payload),
};
