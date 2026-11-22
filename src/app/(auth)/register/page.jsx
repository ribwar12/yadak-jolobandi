import { Suspense } from "react";
import { RegisterView } from "@/components/auth/register-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "ثبت‌نام در فروشگاه | یدک‌جلوبندی",
  description:
    "ایجاد حساب کاربری جدید در فروشگاه تخصصی قطعات جلوبندی یدک‌جلوبندی.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<Skeleton className="h-[460px] w-full rounded-xl" />}
    >
      <RegisterView />
    </Suspense>
  );
}
