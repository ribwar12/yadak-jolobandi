"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/store/use-auth-store";

function DefaultGuardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function AuthGuard({ children, requiredRole = null, fallback = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated || isAuthenticated) return;

    const search =
      typeof window !== "undefined" ? window.location.search || "" : "";
    const fullPath = `${pathname || "/"}${search}`;
    router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated) {
    return fallback || <DefaultGuardSkeleton />;
  }

  const hasAccess =
    !requiredRole ||
    user?.role === requiredRole ||
    user?.role === "admin";

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          icon={ShieldAlert}
          title="دسترسی محدود به این صفحه"
          description="حساب کاربری شما مجوز مشاهده این بخش را ندارد."
          actionLabel="بازگشت به فروشگاه"
          actionHref="/"
          className="rounded-2xl border border-slate-200 bg-white py-16"
        />
      </div>
    );
  }

  return <>{children}</>;
}
