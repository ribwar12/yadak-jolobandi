import { apiClient } from "./api-client";

export const orderService = {
  createOrder: (payload) => apiClient.post("/orders", payload),
  getMyOrders: () => apiClient.get("/me/orders"),
  getOrderById: (id) => apiClient.get(`/orders/${encodeURIComponent(id)}`),
  processMockPayment: (payload) => apiClient.post("/payments/mock/callback", payload),
};
