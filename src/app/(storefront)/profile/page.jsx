import { Suspense } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { ProfileView } from "@/components/storefront/profile/profile-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "پروفایل کاربری و سفارش‌های من | یدک‌جلوبندی",
  description: "مدیریت مشخصات حساب، نشانی ارسال و مشاهده سوابق سفارش‌های ثبت‌شده.",
};

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <ProfileView />
      </Suspense>
    </AuthGuard>
  );
}
