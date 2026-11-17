import { Suspense } from "react";
import { VerifyOtpView } from "@/components/auth/verify-otp-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "تایید کد یک‌بار مصرف | یدک‌جلوبندی",
  description: "وارد کردن کد تایید ۵ رقمی پیامک‌شده برای ورود به حساب کاربری.",
};

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={<Skeleton className="h-[380px] w-full rounded-xl" />}
    >
      <VerifyOtpView />
    </Suspense>
  );
}
