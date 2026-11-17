import { Suspense } from "react";
import { LoginView } from "@/components/auth/login-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "ورود و ثبت‌نام | یدک‌جلوبندی",
  description:
    "ورود سریع با شماره موبایل و کد یک‌بار مصرف پیامکی به فروشگاه تخصصی یدک‌جلوبندی.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={<Skeleton className="h-[360px] w-full rounded-xl" />}
    >
      <LoginView />
    </Suspense>
  );
}
