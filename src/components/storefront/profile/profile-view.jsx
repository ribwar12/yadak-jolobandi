"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Printer,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { useProfile, useUpdateProfile } from "@/hooks/queries/use-auth";
import { useProvinces } from "@/hooks/queries/use-catalog";
import { useMyOrders } from "@/hooks/queries/use-orders";
import { formatPersianDate, ORDER_STATUS_META } from "@/lib/order-status";
import { cn, formatNumber, formatPrice, toEnglishDigits } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export function ProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "account" ? "account" : "orders";
  const [activeTab, setActiveTab] = useState(initialTab);

  const storeUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: profileUser } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: provinces = [] } = useProvinces();

  const user = profileUser || storeUser;

  const [form, setForm] = useState({
    fullName: "",
    province: "تهران",
    city: "تهران",
    address: "",
    postalCode: "",
  });
  const initRef = useRef(false);

  useEffect(() => {
    const paramTab = searchParams.get("tab");
    if (paramTab === "account" || paramTab === "orders") {
      setActiveTab(paramTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user || initRef.current) return;
    initRef.current = true;
    setForm({
      fullName: user.fullName || "",
      province: user.province || "تهران",
      city: user.city || "تهران",
      address: user.address || "",
      postalCode: user.postalCode || "",
    });
  }, [user]);

  const activeProvince = useMemo(
    () => provinces.find((p) => p.name === form.province) || provinces[0],
    [provinces, form.province]
  );
  const cities = activeProvince?.cities || ["تهران"];

  const handleProvinceChange = (provinceName) => {
    const found = provinces.find((p) => p.name === provinceName);
    setForm((prev) => ({
      ...prev,
      province: provinceName,
      city: found?.cities?.[0] || "",
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const cleanPostal = toEnglishDigits(form.postalCode).trim();
    if (cleanPostal && !/^\d{10}$/.test(cleanPostal)) {
      toast.error("کد پستی باید ۱۰ رقم باشد");
      return;
    }

    updateProfile.mutate({
      fullName: form.fullName.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      postalCode: cleanPostal,
    });
  };

  const handleLogout = () => {
    logout();
    toast.info("از حساب کاربری خارج شدید");
    router.replace("/");
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* سربرگ پروفایل */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 text-accent shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {user?.fullName || "حساب کاربری من"}
            </h1>
            <p
              dir="ltr"
              className="text-xs sm:text-sm font-mono text-slate-500 text-right mt-0.5"
            >
              {user?.phone}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold self-start sm:self-center"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج از حساب کاربری</span>
        </Button>
      </div>

      {/* تب‌ها */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm">
            <Package className="h-4 w-4 text-accent" />
            سفارش‌های من ({formatNumber(orders.length)})
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 text-xs sm:text-sm">
            <MapPin className="h-4 w-4 text-accent" />
            مشخصات و نشانی پستی
          </TabsTrigger>
        </TabsList>

        {/* تب سفارش‌ها */}
        <TabsContent value="orders" className="mt-5 space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="هنوز سفارشی ثبت نکرده‌اید"
              description="با انتخاب خودروی خود در فروشگاه، قطعات سازگار جلوبندی را به سبد خرید اضافه کنید."
              actionLabel="مشاهده قطعات جلوبندی"
              actionHref="/products"
              className="rounded-2xl border border-slate-200 bg-white py-14"
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusMeta =
                  ORDER_STATUS_META[order.status] ||
                  ORDER_STATUS_META.pending_payment;

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                        <span className="font-mono font-black text-slate-900">
                          {order.id}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {formatPersianDate(order.createdAt, false)}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-bold",
                          statusMeta.badgeClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="flex items-center justify-between gap-2 text-xs text-slate-700"
                        >
                          <span className="font-semibold line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-slate-500 whitespace-nowrap tabular-nums">
                            {formatNumber(item.quantity)} عدد
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="text-xs sm:text-sm">
                        <span className="text-slate-500">مبلغ کل: </span>
                        <strong className="font-black text-slate-900 tabular-nums">
                          {formatPrice(order.payableAmount)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.paymentStatus === "pending" && (
                          <Button
                            variant="accent"
                            size="sm"
                            className="h-8 text-xs font-bold"
                            asChild
                          >
                            <Link
                              href={`/payment/mock-gateway?orderId=${encodeURIComponent(
                                order.id
                              )}`}
                            >
                              پرداخت سفارش
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-bold"
                          asChild
                        >
                          <Link
                            href={`/order-success/${encodeURIComponent(
                              order.id
                            )}`}
                          >
                            <Printer className="h-3.5 w-3.5 text-accent" />
                            <span>مشاهده فاکتور و جزئیات</span>
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* تب ویرایش مشخصات و نشانی */}
        <TabsContent value="account" className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm max-w-2xl">
            <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">
              ویرایش مشخصات فردی و نشانی پیش‌فرض
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pr-name" className="text-xs font-bold">
                    نام و نام خانوادگی
                  </Label>
                  <Input
                    id="pr-name"
                    placeholder="نام و نام خانوادگی شما"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pr-phone" className="text-xs font-bold">
                    شماره موبایل (ثبت‌شده)
                  </Label>
                  <Input
                    id="pr-phone"
                    dir="ltr"
                    disabled
                    value={user?.phone || ""}
                    className="text-right font-mono bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pr-province" className="text-xs font-bold">
                    استان
                  </Label>
                  <select
                    id="pr-province"
                    value={form.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-accent focus:outline-none"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pr-city" className="text-xs font-bold">
                    شهر
                  </Label>
                  <select
                    id="pr-city"
                    value={form.city}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-accent focus:outline-none"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pr-address" className="text-xs font-bold">
                  نشانی کامل پستی
                </Label>
                <textarea
                  id="pr-address"
                  rows={3}
                  placeholder="نشانی دقیق برای ارسال مرسوله‌ها..."
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <Label htmlFor="pr-postal" className="text-xs font-bold">
                  کد پستی ۱۰ رقمی
                </Label>
                <Input
                  id="pr-postal"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="1933861475"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      postalCode: toEnglishDigits(e.target.value)
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  className="text-right font-mono"
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                disabled={updateProfile.isPending}
                className="gap-2 font-extrabold"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>ذخیره اطلاعات پروفایل</span>
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
