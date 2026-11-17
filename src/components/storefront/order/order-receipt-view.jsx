"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  FileSearch,
  Home,
  Package,
  Printer,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderTimeline } from "@/components/storefront/order/order-timeline";
import { useOrderDetail } from "@/hooks/queries/use-orders";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { formatPersianDate, ORDER_STATUS_META } from "@/lib/order-status";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export function OrderReceiptView({ orderId }) {
  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const { data: settings } = useSiteSettings();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-5">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          icon={FileSearch}
          title="رسید یا سفارش مورد نظر یافت نشد"
          description="شماره سفارش نامعتبر است یا به حساب کاربری فعلی تعلق ندارد."
          actionLabel="مشاهده سفارش‌های من"
          actionHref="/profile?tab=orders"
          className="rounded-2xl border border-slate-200 bg-white py-16"
        />
      </div>
    );
  }

  const isPaid = order.paymentStatus === "paid";
  const isFailed = order.paymentStatus === "failed" || order.status === "cancelled";
  const statusMeta =
    ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending_payment;

  const handleCopyCode = (label, value) => {
    if (!value || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(value);
    toast.success(`${label} کپی شد`);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* بنر وضعیت تراکنش (مخفی هنگام چاپ) */}
      <div
        className={cn(
          "rounded-2xl border p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden",
          isPaid
            ? "border-emerald-200 bg-emerald-50/80"
            : isFailed
              ? "border-red-200 bg-red-50/85"
              : "border-amber-200 bg-amber-50/80"
        )}
      >
        <div className="flex items-start gap-3">
          {isPaid ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-8 w-8 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {isPaid
                ? "سفارش شما با موفقیت ثبت و پرداخت شد"
                : isFailed
                  ? "پرداخت سفارش ناموفق بود"
                  : "سفارش در انتظار تایید پرداخت"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {isPaid
                ? "مرسوله شما در صف آماده‌سازی انبار مرکزی چراغ‌برق قرار گرفت. از طریق کد پیگیری زیر می‌توانید وضعیت ارسال را بررسی کنید."
                : "تراکنش بانکی تکمیل نشد. در صورت تمایل می‌توانید مجدداً برای پرداخت اقدام کنید."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isFailed && (
            <Button variant="accent" size="sm" className="gap-1.5 font-bold" asChild>
              <Link href={`/payment/mock-gateway?orderId=${encodeURIComponent(order.id)}`}>
                <RefreshCw className="h-4 w-4" />
                تلاش مجدد پرداخت
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 bg-white font-bold border-slate-300"
          >
            <Printer className="h-4 w-4 text-accent" />
            چاپ فاکتور رسمی
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 font-bold" asChild>
            <Link href="/profile?tab=orders">
              <Package className="h-4 w-4" />
              سفارش‌های من
            </Link>
          </Button>
        </div>
      </div>

      {/* تایم‌لاین وضعیت سفارش (مخفی هنگام چاپ) */}
      <div className="print:hidden">
        <OrderTimeline
          status={order.status}
          paymentStatus={order.paymentStatus}
        />
      </div>

      {/* فاکتور رسمی قابل چاپ (@media print) */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm space-y-6 print:border-0 print:shadow-none print:p-0">
        {/* سربرگ فاکتور */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              فاکتور رسمی فروش قطعات — {settings?.storeName || "یدک‌جلوبندی"}
            </h2>
            <p className="text-xs text-slate-500">
              {settings?.address ||
                "تهران، خیابان امیرکبیر (چراغ‌برق)، کوچه ناظم‌الاطباء جنوبی"}
            </p>
            <p className="text-xs text-slate-500">
              تلفن پشتیبانی:{" "}
              <span dir="ltr" className="font-mono font-bold text-slate-800">
                {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5 min-w-[230px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">شماره سفارش:</span>
              <button
                type="button"
                onClick={() => handleCopyCode("شماره سفارش", order.id)}
                className="inline-flex items-center gap-1 font-mono font-black text-slate-900 hover:text-accent"
              >
                <span>{order.id}</span>
                <Copy className="h-3 w-3 print:hidden" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">تاریخ ثبت:</span>
              <span className="font-semibold text-slate-800">
                {formatPersianDate(order.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">وضعیت:</span>
              <span
                className={cn(
                  "rounded border px-2 py-0.5 text-[11px] font-bold",
                  statusMeta.badgeClass
                )}
              >
                {statusMeta.label}
              </span>
            </div>
            {order.paymentRefId && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">شماره مرجع بانک:</span>
                <span className="font-mono font-bold text-slate-800">
                  {order.paymentRefId}
                </span>
              </div>
            )}
            {order.postalTrackingCode && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">کد رهگیری مرسوله:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {order.postalTrackingCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* مشخصات خریدار و ارسال */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <p className="font-extrabold text-slate-900">مشخصات خریدار و گیرنده:</p>
            <p className="text-slate-700">
              نام تحویل‌گیرنده: <strong>{order.customer?.fullName}</strong>
            </p>
            <p className="text-slate-700">
              شماره تماس:{" "}
              <strong dir="ltr" className="font-mono">
                {order.customer?.phone}
              </strong>
            </p>
            {order.customer?.notes && (
              <p className="text-slate-600 text-xs">
                توضیحات: {order.customer.notes}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="font-extrabold text-slate-900">نشانی و روش ارسال:</p>
            <p className="text-slate-700 leading-relaxed">
              {order.customer?.province}، {order.customer?.city} —{" "}
              {order.customer?.address}
            </p>
            <p className="text-slate-700">
              کد پستی:{" "}
              <strong className="font-mono">{order.customer?.postalCode}</strong>
            </p>
            <p className="text-xs font-bold text-accent">
              روش ارسال: {order.shippingMethodTitle}
            </p>
          </div>
        </div>

        {/* جدول اقلام فاکتور */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 font-extrabold w-10">#</th>
                <th className="px-3 py-2.5 font-extrabold">شرح قطعه و کد فنی</th>
                <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">
                  گارانتی
                </th>
                <th className="px-3 py-2.5 font-extrabold text-center whitespace-nowrap">
                  تعداد
                </th>
                <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">
                  مبلغ واحد
                </th>
                <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">
                  جمع کل
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items?.map((item, idx) => (
                <tr key={`${item.productId}-${idx}`}>
                  <td className="px-3 py-3 text-slate-500 tabular-nums">
                    {formatNumber(idx + 1)}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.sku} • {item.brandName}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {item.warranty}
                  </td>
                  <td className="px-3 py-3 text-center font-bold tabular-nums">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap tabular-nums text-slate-700">
                    {formatPrice(item.finalUnitPrice)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-bold text-slate-900 tabular-nums">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* جمع مالی */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>جمع کل اقلام:</span>
              <span className="font-bold tabular-nums">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex items-center justify-between text-red-600">
                <span>تخفیف اعمال‌شده:</span>
                <span className="font-bold tabular-nums">
                  {formatPrice(order.discountTotal)} −
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600">
              <span>هزینه ارسال:</span>
              <span className="font-bold tabular-nums">
                {order.shippingCost === 0
                  ? "رایگان"
                  : formatPrice(order.shippingCost)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm sm:text-base font-black text-slate-900">
              <span>مبلغ کل فاکتور:</span>
              <span className="text-accent tabular-nums">
                {formatPrice(order.payableAmount)}
              </span>
            </div>
          </div>
        </div>
      </article>

      <div className="flex justify-center print:hidden">
        <Button variant="outline" size="sm" className="gap-2 font-bold" asChild>
          <Link href="/">
            <Home className="h-4 w-4 text-accent" />
            بازگشت به صفحه اصلی فروشگاه
          </Link>
        </Button>
      </div>
    </div>
  );
}
