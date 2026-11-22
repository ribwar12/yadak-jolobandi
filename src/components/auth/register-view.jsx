"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthModeTabs } from "@/components/auth/auth-tabs";
import { useRegister } from "@/hooks/queries/use-auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { toEnglishDigits } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export function RegisterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const register = useRegister();

  const safeRedirect = getSafeRedirectPath(searchParams.get("redirect"));

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(safeRedirect);
    }
  }, [hydrated, isAuthenticated, router, safeRedirect]);

  const clearFieldError = (field) => {
    if (formError) setFormError("");
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPhone = toEnglishDigits(phone).trim();
    const nextErrors = {};

    if (cleanUsername.length < 3) {
      nextErrors.username = "نام کاربری باید حداقل ۳ کاراکتر باشد.";
    }
    if (!/^09\d{9}$/.test(cleanPhone)) {
      nextErrors.phone = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.";
    }
    if (password.length < 6) {
      nextErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "تکرار رمز عبور با رمز عبور مطابقت ندارد.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setFormError("");
    register.mutate(
      {
        username: cleanUsername,
        phone: cleanPhone,
        password,
        confirmPassword,
      },
      {
        onSuccess: () => {
          router.replace(safeRedirect);
        },
        onError: (err) => {
          setFormError(err?.message || "ثبت‌نام انجام نشد. مجدداً تلاش کنید.");
        },
      }
    );
  };

  return (
    <Card className="border-slate-200 bg-white shadow-md">
      <CardHeader className="space-y-4 pb-4">
        <AuthModeTabs activeMode="register" redirectPath={safeRedirect} />

        <div className="space-y-1 text-center sm:text-right">
          <CardTitle className="text-xl font-black text-slate-900">
            ثبت‌نام حساب جدید
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            برای خرید قطعات جلوبندی و پیگیری سفارش‌ها، اطلاعات زیر را تکمیل کنید.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="reg-username" className="text-xs font-bold">
              نام کاربری
            </Label>
            <Input
              id="reg-username"
              type="text"
              autoFocus
              autoComplete="username"
              placeholder="حداقل ۳ کاراکتر (مثلاً: reza_206)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearFieldError("username");
              }}
            />
            {errors.username && (
              <p className="text-[11px] font-bold text-red-600">
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-phone" className="text-xs font-bold">
              شماره موبایل
            </Label>
            <Input
              id="reg-phone"
              type="tel"
              inputMode="numeric"
              dir="ltr"
              autoComplete="tel"
              placeholder="09123456789"
              value={phone}
              onChange={(e) => {
                setPhone(
                  toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11)
                );
                clearFieldError("phone");
              }}
              className="text-right font-mono font-semibold"
            />
            {errors.phone && (
              <p className="text-[11px] font-bold text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-xs font-bold">
              رمز عبور
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="new-password"
                placeholder="حداقل ۶ کاراکتر"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                className="text-right pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-bold text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm" className="text-xs font-bold">
              تکرار رمز عبور
            </Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showConfirm ? "text" : "password"}
                dir="ltr"
                autoComplete="new-password"
                placeholder="رمز عبور را مجدداً وارد کنید"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError("confirmPassword");
                }}
                className="text-right pl-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={
                  showConfirm ? "مخفی کردن تکرار رمز عبور" : "نمایش تکرار رمز عبور"
                }
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] font-bold text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
            >
              {formError}
            </p>
          )}

          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={register.isPending}
              className="w-full h-11 gap-2 font-extrabold text-sm shadow-sm"
            >
              {register.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ثبت‌نام...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>ثبت‌نام و ایجاد حساب</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-10 gap-2 border-slate-200 text-xs font-bold text-slate-700"
              asChild
            >
              <Link href="/">
                <ArrowRight className="h-4 w-4" />
                <span>بازگشت به فروشگاه</span>
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
