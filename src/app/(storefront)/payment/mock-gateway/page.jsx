import { Suspense } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { MockGatewayView } from "@/components/storefront/checkout/mock-gateway-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "شبیه‌ساز درگاه پرداخت | یدک‌جلوبندی",
  description: "درگاه آزمایشی شبیه‌سازی تراکنش بانکی جهت تکمیل تست خرید.",
};

export default function MockGatewayPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-10 max-w-lg">
            <Skeleton className="h-[360px] w-full rounded-2xl" />
          </div>
        }
      >
        <MockGatewayView />
      </Suspense>
    </AuthGuard>
  );
}
