"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { useOrderDetail, useProcessMockPayment } from "@/hooks/queries/use-orders";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export function MockGatewayView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const clearCart = useCartStore((s) => s.clearCart);
  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const processPayment = useProcessMockPayment();

  if (!USE_MOCK) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <EmptyState
          icon={ShieldAlert}
          title="درگاه شبیه‌ساز فقط در حالت آزمایشی فعال است"
          description="در محیط واقعی، پرداخت از طریق درگاه رسمی شاپرک انجام می‌شود."
          actionLabel="بازگشت به فروشگاه"
          actionHref="/"
          className="rounded-2xl border border-slate-200 bg-white py-14"
        />
      </div>
    );
  }

  if (!orderId || isError) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <EmptyState
          icon={XCircle}
          title="اطلاعات تراکنش سفارش یافت نشد"
          description="شناسه سفارش نامعتبر است یا به حساب کاربری دیگری تعلق دارد."
          actionLabel="بازگشت به سبد و تسویه‌حساب"
          actionHref="/checkout"
          className="rounded-2xl border border-slate-200 bg-white py-14"
        />
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm font-bold">در حال اتصال امن به شبیه‌ساز درگاه شاپرک...</p>
      </div>
    );
  }

  const handleCallback = (success) => {
    processPayment.mutate(
      { orderId: order.id, success },
      {
        onSuccess: () => {
          if (success) {
            clearCart();
          }
          router.replace(`/order-success/${encodeURIComponent(order.id)}`);
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-lg mx-auto">
        <Card className="border-slate-200 bg-white shadow-lg overflow-hidden">
          {/* هدر شبیه‌ساز شاپرک */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black">شبیه‌ساز درگاه پرداخت بانکی (Mock)</p>
                <p className="text-[11px] text-slate-300">شبکه الکترونیکی پرداخت کارت (شاپرک)</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[11px] font-bold text-emerald-300">
              <Lock className="h-3 w-3" />
              تست امن
            </span>
          </div>

          <CardHeader className="pb-4 space-y-1">
            <CardTitle className="text-base font-black text-slate-900">
              اطلاعات پذیرنده و مبلغ تراکنش
            </CardTitle>
            <CardDescription className="text-xs">
              برای آزمایش فرآیند خرید، نتیجه تراکنش (موفق یا ناموفق) را انتخاب کنید.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200 text-xs sm:text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-slate-500 font-semibold">نام پذیرنده:</span>
                <span className="font-bold text-slate-900">فروشگاه تخصصی یدک‌جلوبندی</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-slate-500 font-semibold">شماره سفارش:</span>
                <span className="font-mono font-bold text-slate-900">{order.id}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-slate-500 font-semibold">مبلغ قابل پرداخت:</span>
                <span className="text-base sm:text-lg font-black text-accent tabular-nums">
                  {formatPrice(order.payableAmount)}
                </span>
              </div>
            </div>

            {order.paymentStatus === "paid" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-3">
                <p className="text-xs sm:text-sm font-bold text-emerald-800">
                  پرداخت این سفارش قبلاً با موفقیت تایید شده است.
                </p>
                <Button variant="accent" size="sm" asChild>
                  <Link href={`/order-success/${encodeURIComponent(order.id)}`}>
                    مشاهده رسید و فاکتور سفارش
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Button
                  type="button"
                  size="lg"
                  disabled={processPayment.isPending}
                  onClick={() => handleCallback(true)}
                  className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-sm"
                >
                  {processPayment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>پرداخت موفق و تکمیل خرید</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={processPayment.isPending}
                  onClick={() => handleCallback(false)}
                  className="w-full h-11 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-sm"
                >
                  <XCircle className="h-4 w-4" />
                  <span>انصراف / شبیه‌سازی پرداخت ناموفق</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
