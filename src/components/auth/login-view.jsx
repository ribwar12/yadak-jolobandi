"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, Loader2, Smartphone } from "lucide-react";
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
import { useRequestOtp } from "@/hooks/queries/use-auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { toEnglishDigits } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export function getSafeRedirectPath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return "/";
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed.startsWith("/login") || trimmed.startsWith("/verify-otp")) return "/";
  return trimmed;
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const requestOtp = useRequestOtp();

  const safeRedirect = getSafeRedirectPath(searchParams.get("redirect"));

  const [phoneInput, setPhoneInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(safeRedirect);
    }
  }, [hydrated, isAuthenticated, router, safeRedirect]);

  useEffect(() => {
    if (hydrated && pendingPhone && !prefilledRef.current) {
      prefilledRef.current = true;
      setPhoneInput(pendingPhone);
    }
  }, [hydrated, pendingPhone]);

  const handlePhoneChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value)
      .replace(/\D/g, "")
      .slice(0, 11);
    setPhoneInput(cleaned);
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalized = toEnglishDigits(phoneInput).trim();

    if (!/^09\d{9}$/.test(normalized)) {
      setErrorMsg("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود (مثلاً ۰۹۱۲۳۴۵۶۷۸۹).");
      return;
    }

    requestOtp.mutate(
      {
        phone: normalized,
        redirectPath: safeRedirect !== "/" ? safeRedirect : null,
      },
      {
        onSuccess: () => {
          const query =
            safeRedirect !== "/"
              ? `?redirect=${encodeURIComponent(safeRedirect)}`
              : "";
          router.push(`/verify-otp${query}`);
        },
        onError: (err) => {
          setErrorMsg(err?.message || "ارسال کد تایید ناموفق بود.");
        },
      }
    );
  };

  return (
    <Card className="border-slate-200 bg-white shadow-md">
      <CardHeader className="space-y-2 pb-4 text-center sm:text-right">
        <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 text-accent">
          <Smartphone className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-black text-slate-900">
          ورود یا ثبت‌نام در یدک‌جلوبندی
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          برای ادامه خرید، پیگیری سفارش و ذخیره گاراژ خودرو، شماره موبایل خود را وارد کنید.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-phone" className="text-xs sm:text-sm font-bold">
              شماره موبایل
            </Label>
            <Input
              id="login-phone"
              type="tel"
              inputMode="numeric"
              dir="ltr"
              autoFocus
              autoComplete="tel"
              placeholder="09123456789"
              value={phoneInput}
              onChange={handlePhoneChange}
              className="h-11 text-base font-bold tracking-wider text-center tabular-nums"
            />
            {errorMsg && (
              <p role="alert" className="text-xs font-bold text-red-600">
                {errorMsg}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={requestOtp.isPending}
            className="w-full h-11 gap-2 font-extrabold text-sm shadow-sm"
          >
            {requestOtp.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ارسال کد تایید...</span>
              </>
            ) : (
              <>
                <span>دریافت کد تایید</span>
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            در محیط آزمایشی، پس از ثبت هر شماره موبایل معتبر با{" "}
            <span className="font-mono font-bold text-slate-800">09...</span>، از کد{" "}
            <strong className="text-slate-900 font-mono">12345</strong> استفاده کنید (شماره مدیر آزمایشی:{" "}
            <span className="font-mono font-bold text-slate-800">09120000000</span>).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
