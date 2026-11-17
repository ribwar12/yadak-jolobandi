"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OtpInput } from "@/components/auth/otp-input";
import { getSafeRedirectPath } from "@/components/auth/login-view";
import { useRequestOtp, useVerifyOtp } from "@/hooks/queries/use-auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

function formatCountdown(seconds) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${formatNumber(mins).padStart(2, "۰")}:${formatNumber(secs).padStart(
    2,
    "۰"
  )}`;
}

export function VerifyOtpView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const otpExpiresAt = useAuthStore((s) => s.otpExpiresAt);
  const redirectAfterLogin = useAuthStore((s) => s.redirectAfterLogin);
  const clearRedirect = useAuthStore((s) => s.clearRedirect);

  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();

  const urlRedirect = searchParams.get("redirect");
  const targetRedirect = getSafeRedirectPath(urlRedirect || redirectAfterLogin);

  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120);

  // ریدایرکت کاربر واردشده یا کاربر بدون شماره در انتظار
  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated) {
      clearRedirect();
      router.replace(targetRedirect);
      return;
    }

    if (!pendingPhone) {
      const query =
        targetRedirect !== "/"
          ? `?redirect=${encodeURIComponent(targetRedirect)}`
          : "";
      router.replace(`/login${query}`);
    }
  }, [
    hydrated,
    isAuthenticated,
    pendingPhone,
    router,
    targetRedirect,
    clearRedirect,
  ]);

  // تایمر ۱۲۰ ثانیه‌ای بر اساس زمان انقضای ذخیره شده
  useEffect(() => {
    if (!otpExpiresAt) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((otpExpiresAt - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [otpExpiresAt]);

  const submitCode = useCallback(
    (codeToVerify) => {
      if (!pendingPhone || verifyOtp.isPending) return;
      if (codeToVerify.length !== 5) {
        setErrorMsg("لطفاً تمام ۵ رقم کد تایید را وارد کنید.");
        return;
      }

      setErrorMsg("");
      verifyOtp.mutate(
        { phone: pendingPhone, code: codeToVerify },
        {
          onSuccess: () => {
            clearRedirect();
            router.replace(targetRedirect);
          },
          onError: (err) => {
            setErrorMsg(
              err?.message || "کد تایید واردشده نادرست است (کد آزمایشی: ۱۲۳۴۵)"
            );
          },
        }
      );
    },
    [pendingPhone, verifyOtp, clearRedirect, router, targetRedirect]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    submitCode(code);
  };

  const handleResend = () => {
    if (!pendingPhone || secondsLeft > 0 || requestOtp.isPending) return;
    setCode("");
    setErrorMsg("");
    requestOtp.mutate({
      phone: pendingPhone,
      redirectPath: targetRedirect !== "/" ? targetRedirect : null,
    });
  };

  if (!hydrated || !pendingPhone) {
    return (
      <Card className="border-slate-200 bg-white shadow-md p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">
          در حال انتقال به صفحه ورود...
        </p>
      </Card>
    );
  }

  const editPhoneHref =
    targetRedirect !== "/"
      ? `/login?redirect=${encodeURIComponent(targetRedirect)}`
      : "/login";

  return (
    <Card className="border-slate-200 bg-white shadow-md">
      <CardHeader className="space-y-2 pb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 text-accent">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-black text-slate-900">
          کد تایید را وارد کنید
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          کد ۵ رقمی به شماره{" "}
          <strong dir="ltr" className="font-mono text-slate-900">
            {pendingPhone}
          </strong>{" "}
          ارسال شد.
        </CardDescription>

        <div className="pt-1">
          <Link
            href={editPhoneHref}
            className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>ویرایش شماره موبایل</span>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <OtpInput
            length={5}
            value={code}
            onChange={(nextVal) => {
              setCode(nextVal);
              if (errorMsg) setErrorMsg("");
            }}
            onComplete={submitCode}
            disabled={verifyOtp.isPending}
            hasError={Boolean(errorMsg)}
          />

          {errorMsg && (
            <p
              role="alert"
              className="text-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-3"
            >
              {errorMsg}
            </p>
          )}

          <div className="text-center text-xs text-slate-500">
            {secondsLeft > 0 ? (
              <span className="tabular-nums">
                ارسال مجدد کد تا{" "}
                <strong className="text-slate-800">
                  {formatCountdown(secondsLeft)}
                </strong>{" "}
                دیگر
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={requestOtp.isPending}
                className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline disabled:opacity-60"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>
                  {requestOtp.isPending
                    ? "در حال ارسال مجدد..."
                    : "ارسال مجدد کد تایید"}
                </span>
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={verifyOtp.isPending || code.length !== 5}
            className="w-full h-11 gap-2 font-extrabold text-sm shadow-sm"
          >
            {verifyOtp.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال بررسی کد...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>تایید و ورود به حساب</span>
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span>کد آزمایشی پیش‌فرض: <strong className="font-mono text-slate-800">12345</strong></span>
          <Link
            href={editPhoneHref}
            className="inline-flex items-center gap-1 hover:text-slate-800 font-semibold"
          >
            <ArrowRight className="h-3 w-3" />
            بازگشت
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
