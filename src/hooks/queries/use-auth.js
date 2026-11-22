"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/use-auth-store";

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => authService.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
      toast.success("ثبت‌نام با موفقیت انجام شد! خوش آمدید.");
    },
    onError: (err) => {
      toast.error(err?.message || "خطا در ثبت‌نام حساب کاربری");
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
      toast.success("خوش آمدید! با موفقیت وارد حساب کاربری شدید.");
    },
    onError: (err) => {
      toast.error(err?.message || "ورود ناموفق بود");
    },
  });
}

export function useRequestOtp() {
  const setPendingOtp = useAuthStore((s) => s.setPendingOtp);

  return useMutation({
    mutationFn: ({ phone, redirectPath }) =>
      authService.requestOtp({ phone }).then((res) => ({ ...res, redirectPath })),
    onSuccess: (data) => {
      setPendingOtp(data.phone, data.expiresIn || 120, data.redirectPath);
      if (data.mockOtpCode) {
        toast.info(`کد تایید آزمایشی شما: ${data.mockOtpCode}`, {
          description: "در حالت آزمایشی می‌توانید از کد ۱۲۳۴۵ برای ورود استفاده کنید.",
          duration: 8000,
        });
      } else {
        toast.success(data.message || "کد تایید ارسال شد");
      }
    },
    onError: (err) => {
      toast.error(err?.message || "خطا در ارسال کد تایید");
    },
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, code }) => authService.verifyOtp({ phone, code }),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
      toast.success("خوش آمدید! ورود شما با موفقیت انجام شد.");
    },
    onError: (err) => {
      toast.error(err?.message || "کد تایید واردشده معتبر نیست");
    },
  });
}

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => authService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      toast.success("مشخصات کاربری و نشانی شما ذخیره شد");
    },
    onError: (err) => {
      toast.error(err?.message || "خطا در بروزرسانی پروفایل");
    },
  });
}
