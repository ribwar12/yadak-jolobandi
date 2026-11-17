"use client";

import { useState } from "react";
import {
  Copy,
  Loader2,
  PackageSearch,
  Search,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
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
import { OrderTimeline } from "@/components/storefront/order/order-timeline";
import { useTrackOrder } from "@/hooks/queries/use-orders";
import { formatPersianDate, ORDER_STATUS_META } from "@/lib/order-status";
import { cn, formatNumber, formatPrice, toEnglishDigits } from "@/lib/utils";

export function TrackOrderView() {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const trackOrder = useTrackOrder();
  const order = trackOrder.data;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = toEnglishDigits(phone).trim();
    const cleanOrderId = toEnglishDigits(orderId).trim().toUpperCase();

    if (!/^09\d{9}$/.test(cleanPhone) || !cleanOrderId) {
      setErrorMsg("لطفاً شماره موبایل ۱۱ رقمی و کد سفارش را به‌درستی وارد کنید.");
      return;
    }

    setErrorMsg("");
    trackOrder.mutate(
      { phone: cleanPhone, orderId: cleanOrderId },
      {
        onError: (err) => {
          setErrorMsg(err?.message || "سفارشی با مشخصات واردشده یافت نشد.");
        },
      }
    );
  };

  const fillSampleOrder = () => {
    setPhone("09123456789");
    setOrderId("YDK-984210");
    setErrorMsg("");
  };

  const statusMeta = order
    ? ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending_payment
    : null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-1.5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-accent mb-1">
              <PackageSearch className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-black text-slate-900">
              پیگیری وضعیت سفارش و مرسوله
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm leading-relaxed">
              برای مشاهده وضعیت پردازش، کد رهگیری پستی و تایم‌لاین ارسال، شماره موبایل ثبت‌شده و کد سفارش را وارد کنید.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="track-phone" className="text-xs font-bold">
                    شماره موبایل خریدار *
                  </Label>
                  <Input
                    id="track-phone"
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => {
                      setPhone(
                        toEnglishDigits(e.target.value)
                          .replace(/\D/g, "")
                          .slice(0, 11)
                      );
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="text-right font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="track-code" className="text-xs font-bold">
                    کد سفارش (مثال: YDK-984210) *
                  </Label>
                  <Input
                    id="track-code"
                    dir="ltr"
                    placeholder="YDK-984210"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(toEnglishDigits(e.target.value).toUpperCase());
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="text-right font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {errorMsg && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                >
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  disabled={trackOrder.isPending}
                  className="gap-2 font-extrabold"
                >
                  {trackOrder.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>استعلام وضعیت سفارش</span>
                </Button>

                <button
                  type="button"
                  onClick={fillSampleOrder}
                  className="text-xs font-bold text-accent hover:underline text-right"
                >
                  تست سریع با سفارش نمونه (YDK-984210)
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* نتیجه پیگیری */}
        {order && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">شماره پیگیری سفارش:</p>
                  <h2 className="text-lg font-black font-mono text-slate-900">
                    {order.id}
                  </h2>
                </div>
                <span
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-bold",
                    statusMeta.badgeClass
                  )}
                >
                  {statusMeta.label}
                </span>
              </div>

              <OrderTimeline
                status={order.status}
                paymentStatus={order.paymentStatus}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-slate-500">تاریخ ثبت:</span>
                  <p className="font-bold text-slate-900">
                    {formatPersianDate(order.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500">شیوه ارسال:</span>
                  <p className="font-bold text-slate-900 inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-accent" />
                    {order.shippingMethodTitle}
                  </p>
                </div>
                {order.postalTrackingCode && (
                  <div className="sm:col-span-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-600 font-semibold">
                      بارکد پستی / باربری:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(order.postalTrackingCode);
                        toast.success("بارکد رهگیری کپی شد");
                      }}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-700 hover:underline"
                    >
                      <span>{order.postalTrackingCode}</span>
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-700">
                  اقلام داخل بسته ({formatNumber(order.items?.length || 0)} ردیف):
                </h3>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {order.items?.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                    >
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-slate-500 whitespace-nowrap tabular-nums">
                        {formatNumber(item.quantity)} عدد •{" "}
                        <strong className="text-slate-900">
                          {formatPrice(item.lineTotal)}
                        </strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
