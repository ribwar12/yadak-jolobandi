"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/store/use-auth-store";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (payload) => orderService.createOrder(payload),
    onSuccess: (data) => {
      if (data?.order?.customer) {
        updateUser({
          fullName: data.order.customer.fullName,
          province: data.order.customer.province,
          city: data.order.customer.city,
          address: data.order.customer.address,
          postalCode: data.order.customer.postalCode,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    onError: (err) => {
      toast.error(err?.message || "خطا در ثبت سفارش");
    },
  });
}

export function useProcessMockPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => orderService.processMockPayment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
      if (data?.order?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(data.order.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.cars });
    },
    onError: (err) => {
      toast.error(err?.message || "خطا در پردازش تراکنش بانکی");
    },
  });
}

export function useMyOrders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.orders.my,
    queryFn: () => orderService.getMyOrders(),
    enabled: isAuthenticated,
  });
}

export function useOrderDetail(orderId) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: Boolean(orderId && isAuthenticated),
  });
}
