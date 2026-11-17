"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  Loader2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { useProfile } from "@/hooks/queries/use-auth";
import { useProvinces } from "@/hooks/queries/use-catalog";
import { useCreateOrder } from "@/hooks/queries/use-orders";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn, formatNumber, formatPrice, toEnglishDigits } from "@/lib/utils";
import { productService } from "@/services/product.service";
import { useAuthStore } from "@/store/use-auth-store";
import { getCartTotals, useCartStore } from "@/store/use-cart-store";

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();

  const items = useCartStore((s) => s.items);
  const syncItemsWithCatalog = useCartStore((s) => s.syncItemsWithCatalog);
  const storeUser = useAuthStore((s) => s.user);
  const { data: profileUser } = useProfile();
  const { data: provinces = [] } = useProvinces();
  const { data: settings } = useSiteSettings();
  const createOrder = useCreateOrder();

  const user = profileUser || storeUser;
  const shippingMethods = useMemo(
    () => settings?.shippingMethods || [],
    [settings?.shippingMethods]
  );

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    province: "تهران",
    city: "تهران",
    address: "",
    postalCode: "",
    notes: "",
    shippingMethod: "courier",
    saveAddressToProfile: true,
  });
  const [errors, setErrors] = useState({});
  const [isValidatingPrices, setIsValidatingPrices] = useState(false);
  const initializedRef = useRef(false);

  // پیش‌پرکردن فرم از اطلاعات پروفایل کاربری (فقط یک بار پس از دریافت)
  useEffect(() => {
    if (!hydrated || !user || initializedRef.current) return;
    initializedRef.current = true;
    setForm((prev) => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      phone: user.phone || prev.phone,
      province: user.province || prev.province,
      city: user.city || prev.city,
      address: user.address || prev.address,
      postalCode: user.postalCode || prev.postalCode,
    }));
  }, [hydrated, user]);

  // پیش‌فرض روش ارسال متناسب با تنظیمات سایت
  useEffect(() => {
    if (shippingMethods.length === 0) return;
    setForm((prev) => {
      const exists = shippingMethods.some((m) => m.id === prev.shippingMethod);
      return exists ? prev : { ...prev, shippingMethod: shippingMethods[0].id };
    });
  }, [shippingMethods]);

  const activeProvince = useMemo(
    () => provinces.find((p) => p.name === form.province) || provinces[0],
    [provinces, form.province]
  );
  const availableCities = activeProvince?.cities || ["تهران"];

  const totals = getCartTotals(hydrated ? items : [], settings);
  const selectedMethod =
    shippingMethods.find((m) => m.id === form.shippingMethod) ||
    shippingMethods[0] || {
      id: "post",
      title: "پست پیشتاز سراسری",
      baseCost: 85000,
    };

  const shippingCost = totals.isFreeShipping
    ? 0
    : Number(selectedMethod.baseCost) || 85000;
  const payableAmount = totals.payableItemsTotal + shippingCost;
  const isPriceUpdateMode = Boolean(settings?.priceUpdateMode);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleProvinceChange = (provinceName) => {
    const matched = provinces.find((p) => p.name === provinceName);
    const firstCity = matched?.cities?.[0] || "";
    setForm((prev) => ({
      ...prev,
      province: provinceName,
      city: firstCity,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.province;
      delete next.city;
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    const phone = toEnglishDigits(form.phone).trim();
    const postalCode = toEnglishDigits(form.postalCode).trim();

    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      nextErrors.fullName = "نام و نام خانوادگی تحویل‌گیرنده الزامی است.";
    }
    if (!/^09\d{9}$/.test(phone)) {
      nextErrors.phone = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.";
    }
    if (!form.province.trim()) {
      nextErrors.province = "انتخاب استان الزامی است.";
    }
    if (!form.city.trim()) {
      nextErrors.city = "انتخاب شهر الزامی است.";
    }
    if (!form.address.trim() || form.address.trim().length < 10) {
      nextErrors.address = "نشانی دقیق پستی باید حداقل ۱۰ کاراکتر باشد.";
    }
    if (!/^\d{10}$/.test(postalCode)) {
      nextErrors.postalCode = "کد پستی باید دقیقاً ۱۰ رقم بدون خط تیره باشد.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPriceUpdateMode) {
      toast.error("فروشگاه در حال به‌روزرسانی قیمت‌ها است و ثبت سفارش موقتاً متوقف می‌باشد.");
      return;
    }

    if (!validate()) {
      toast.error("لطفاً فیلدهای مشخص‌شده در فرم ارسال را بررسی کنید.");
      return;
    }

    try {
      setIsValidatingPrices(true);
      // اعتبارسنجی مجدد قیمت و موجودی با آخرین وضعیت کاتالوگ قبل از ثبت سفارش
      const latestCatalog = await productService.getProducts({ pageSize: 100 });
      const freshProducts = latestCatalog?.items || [];
      const currentItems = useCartStore.getState().items;

      const changedNotices = [];
      for (const item of currentItems) {
        const fresh = freshProducts.find((p) => p.id === item.productId);
        if (!fresh) {
          toast.error(`قطعه «${item.title}» دیگر در کاتالوگ فعال نیست.`);
          setIsValidatingPrices(false);
          return;
        }
        if (fresh.stock < item.quantity) {
          toast.error(
            `موجودی انبار برای «${item.title}» تغییر کرده است (موجودی فعلی: ${formatNumber(
              fresh.stock
            )} عدد).`
          );
          syncItemsWithCatalog(freshProducts);
          setIsValidatingPrices(false);
          return;
        }
        if (fresh.effectivePrice !== item.effectivePrice) {
          changedNotices.push(item.title);
        }
      }

      if (changedNotices.length > 0) {
        syncItemsWithCatalog(freshProducts);
        toast.info("قیمت برخی اقلام سبد خرید مطابق نرخ روز به‌روزرسانی شد.");
      }

      const payload = {
        fullName: form.fullName.trim(),
        phone: toEnglishDigits(form.phone).trim(),
        province: form.province.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        postalCode: toEnglishDigits(form.postalCode).trim(),
        notes: form.notes.trim(),
        shippingMethod: selectedMethod.id,
        saveAddressToProfile: form.saveAddressToProfile,
        items: useCartStore.getState().items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const res = await createOrder.mutateAsync(payload);
      router.push(
        res.paymentUrl ||
          `/payment/mock-gateway?orderId=${encodeURIComponent(res.order.id)}`
      );
    } catch {
      // خطا توسط useCreateOrder نمایش داده می‌شود
    } finally {
      setIsValidatingPrices(false);
    }
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          icon={ShoppingBag}
          title="سبد خرید شما برای تسویه‌حساب خالی است"
          description="ابتدا قطعات یا پک‌های مورد نیاز خودرو را به سبد خرید اضافه کنید، سپس برای تکمیل نشانی و پرداخت به این صفحه برگردید."
          actionLabel="مشاهده کاتالوگ قطعات"
          actionHref="/products"
          className="rounded-2xl border border-slate-200 bg-white py-16"
        />
      </div>
    );
  }

  const isBusy = isValidatingPrices || createOrder.isPending;

  return (
    <div className="container mx-auto px-4 py-5 sm:py-8 space-y-5">
      {/* نان‌ریزه */}
      <nav
        aria-label="مسیر تسویه‌حساب"
        className="flex items-center gap-1.5 text-xs text-slate-500"
      >
        <Link href="/" className="hover:text-accent">
          خانه
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-slate-800">تسویه‌حساب و ثبت سفارش</span>
      </nav>

      {/* هشدار مسدودشدن خرید در حالت نوسان بازار */}
      {isPriceUpdateMode && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-black text-amber-950">
                ثبت سفارش آنلاین در حال حاضر مسدود است
              </h2>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                {settings?.priceUpdateMessage ||
                  "به علت نوسانات بازار، قیمت قطعات در حال به‌روزرسانی است. لطفاً برای ثبت فوری سفارش با واحد فروش تماس بگیرید."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 bg-white text-amber-900 font-bold gap-1.5 shrink-0 self-start sm:self-center"
            asChild
          >
            <a href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}>
              <PhoneCall className="h-4 w-4" />
              {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
            </a>
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* ستون راست: فرم گیرنده و روش ارسال */}
        <div className="lg:col-span-8 space-y-6">
          {/* کارت نشانی گیرنده */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="h-5 w-5 text-accent" />
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                ۱. مشخصات تحویل‌گیرنده و نشانی ارسال
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="co-name" className="text-xs font-bold">
                  نام و نام خانوادگی تحویل‌گیرنده *
                </Label>
                <Input
                  id="co-name"
                  placeholder="مثلاً: علی رضایی"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                />
                {errors.fullName && (
                  <p className="text-[11px] font-bold text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-phone" className="text-xs font-bold">
                  شماره موبایل هماهنگی ارسال *
                </Label>
                <Input
                  id="co-phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="09123456789"
                  value={form.phone}
                  onChange={(e) =>
                    setField(
                      "phone",
                      toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 11)
                    )
                  }
                  className="text-right font-mono"
                />
                {errors.phone && (
                  <p className="text-[11px] font-bold text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-province" className="text-xs font-bold">
                  استان *
                </Label>
                <select
                  id="co-province"
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
                {errors.province && (
                  <p className="text-[11px] font-bold text-red-600">
                    {errors.province}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-city" className="text-xs font-bold">
                  شهر *
                </Label>
                <select
                  id="co-city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-accent focus:outline-none"
                >
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-[11px] font-bold text-red-600">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="co-address" className="text-xs font-bold">
                نشانی کامل پستی (یا آدرس تعمیرگاه جهت ارسال فوری) *
              </Label>
              <textarea
                id="co-address"
                rows={3}
                placeholder="خیابان، کوچه، پلاک، واحد یا نام تعمیرگاه جلوبندی..."
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
              {errors.address && (
                <p className="text-[11px] font-bold text-red-600">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="co-postal" className="text-xs font-bold">
                  کد پستی ۱۰ رقمی *
                </Label>
                <Input
                  id="co-postal"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="1933861475"
                  value={form.postalCode}
                  onChange={(e) =>
                    setField(
                      "postalCode",
                      toEnglishDigits(e.target.value).replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  className="text-right font-mono"
                />
                {errors.postalCode && (
                  <p className="text-[11px] font-bold text-red-600">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-notes" className="text-xs font-bold">
                  توضیحات تکمیلی (اختیاری)
                </Label>
                <Input
                  id="co-notes"
                  placeholder="مثلاً: خودرو روی جک است، تحویل فوری"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.saveAddressToProfile}
                onChange={(e) =>
                  setField("saveAddressToProfile", e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 accent-[#ea580c]"
              />
              <span>ذخیره این نشانی در پروفایل کاربری برای خریدهای بعدی</span>
            </label>
          </section>

          {/* کارت روش ارسال */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="h-5 w-5 text-accent" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                ۲. انتخاب شیوه ارسال مرسوله
              </h2>
            </div>

            <div className="space-y-3">
              {shippingMethods.map((method) => {
                const active = selectedMethod.id === method.id;
                const costText = totals.isFreeShipping
                  ? "رایگان (ارسال رایگان بالای سقف خرید)"
                  : formatPrice(method.baseCost);

                return (
                  <label
                    key={method.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3.5 cursor-pointer transition-all",
                      active
                        ? "border-accent bg-orange-50/50 ring-1 ring-orange-200"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={active}
                        onChange={() => setField("shippingMethod", method.id)}
                        className="mt-1 h-4 w-4 accent-[#ea580c]"
                      />
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {method.title}
                          </span>
                          {method.badge && (
                            <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {method.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-xs font-extrabold whitespace-nowrap mr-7 sm:mr-0",
                        totals.isFreeShipping
                          ? "text-emerald-700"
                          : "text-slate-900"
                      )}
                    >
                      {costText}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* ستون چپ: خلاصه چسبان سفارش */}
        <aside className="lg:col-span-4 lg:sticky lg:top-40 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <h2 className="text-sm sm:text-base font-black text-slate-900 pb-3 border-b border-slate-100">
            خلاصه سبد و صورت‌حساب ({formatNumber(totals.totalCount)} عدد)
          </h2>

          {/* لیست کوتاه اقلام */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pl-1">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2"
              >
                <div className="relative h-12 w-12 shrink-0 rounded-md border border-slate-200 bg-white overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    {formatNumber(item.quantity)} عدد ×{" "}
                    {formatPrice(item.effectivePrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* محاسبات */}
          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>جمع کل کالاها:</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatPrice(totals.subtotal)}
              </span>
            </div>

            {totals.discountTotal > 0 && (
              <div className="flex items-center justify-between text-red-600">
                <span>سود شما از تخفیف:</span>
                <span className="font-bold tabular-nums">
                  {formatPrice(totals.discountTotal)} −
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>هزینه ارسال ({selectedMethod.title.split(" ")[0]}):</span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  shippingCost === 0 ? "text-emerald-700" : "text-slate-800"
                )}
              >
                {shippingCost === 0 ? "رایگان" : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-black text-slate-900">مبلغ قابل پرداخت:</span>
              <span className="text-base sm:text-lg font-black text-accent tabular-nums">
                {formatPrice(payableAmount)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={isBusy || isPriceUpdateMode}
            className="w-full h-11 gap-2 font-black text-sm shadow-sm"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال بررسی قیمت و ثبت سفارش...</span>
              </>
            ) : (
              <>
                <span>تایید و پرداخت آنلاین</span>
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>بررسی لحظه‌ای قیمت و موجودی قبل از انتقال به درگاه</span>
          </div>
        </aside>
      </form>
    </div>
  );
}
