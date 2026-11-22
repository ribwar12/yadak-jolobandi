"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Loader2,
  LogIn,
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
import { useLogin } from "@/hooks/queries/use-auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { toEnglishDigits } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useLogin();

  const safeRedirect = getSafeRedirectPath(searchParams.get("redirect"));

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (!cleanUsername) {
      nextErrors.username = "نام کاربری خود را وارد کنید.";
    }
    if (!/^09\d{9}$/.test(cleanPhone)) {
      nextErrors.phone = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.";
    }
    if (!password) {
      nextErrors.password = "رمز عبور خود را وارد کنید.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setFormError("");
    login.mutate(
      {
        username: cleanUsername,
        phone: cleanPhone,
        password,
      },
      {
        onSuccess: () => {
          router.replace(safeRedirect);
        },
        onError: (err) => {
          setFormError(
            err?.message || "نام کاربری، شماره موبایل یا رمز عبور نادرست است."
          );
        },
      }
    );
  };

  return (
    <Card className="border-slate-200 bg-white shadow-md">
      <CardHeader className="space-y-4 pb-4">
        <AuthModeTabs activeMode="login" redirectPath={safeRedirect} />

        <div className="space-y-1 text-center sm:text-right">
          <CardTitle className="text-xl font-black text-slate-900">
            ورود به حساب کاربری
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            مشخصات حساب خود را برای دسترسی به سفارش‌ها و سبد خرید وارد کنید.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="login-username" className="text-xs font-bold">
              نام کاربری
            </Label>
            <Input
              id="login-username"
              type="text"
              autoFocus
              autoComplete="username"
              placeholder="مثلاً: ali"
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
            <Label htmlFor="login-phone" className="text-xs font-bold">
              شماره موبایل
            </Label>
            <Input
              id="login-phone"
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
            <Label htmlFor="login-password" className="text-xs font-bold">
              رمز عبور
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="current-password"
                placeholder="••••••"
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
              disabled={login.isPending}
              className="w-full h-11 gap-2 font-extrabold text-sm shadow-sm"
            >
              {login.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>ورود به حساب کاربری</span>
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

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5 text-[11px] text-slate-600 leading-relaxed">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            حساب آزمایشی: نام کاربری{" "}
            <strong className="font-mono text-slate-800">ali</strong>، موبایل{" "}
            <strong className="font-mono text-slate-800">09123456789</strong> و رمز{" "}
            <strong className="font-mono text-slate-800">123456</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
