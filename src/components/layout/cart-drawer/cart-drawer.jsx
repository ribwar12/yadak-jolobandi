"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CompatibilityBadge } from "@/components/shared/compatibility-badge";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatNumber, formatPrice } from "@/lib/utils";
import { getCartTotals, useCartStore } from "@/store/use-cart-store";
import { useUiStore } from "@/store/use-ui-store";

export function CartDrawer() {
  const router = useRouter();
  const hydrated = useHydrated();

  const isOpen = useUiStore((s) => s.isCartDrawerOpen);
  const setCartDrawerOpen = useUiStore((s) => s.setCartDrawerOpen);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: settings } = useSiteSettings();
  const isPriceUpdateMode = Boolean(settings?.priceUpdateMode);

  const totals = getCartTotals(hydrated ? items : [], settings);

  const handleCheckout = () => {
    setCartDrawerOpen(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md p-0 flex flex-col bg-slate-50"
      >
        {/* هدر کشوی سبد خرید */}
        <SheetHeader className="p-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-accent border border-orange-200">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base font-black text-slate-900">
                    سبد خرید شما
                  </SheetTitle>
                  <Badge variant="accent" className="text-[11px]">
                    {formatNumber(totals.totalCount)} کالا
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  تحویل فوری همراه با فاکتور رسمی و گارانتی تعویض
                </p>
              </div>
            </div>

            {hydrated && items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
              >
                حذف همه
              </button>
            )}
          </div>
        </SheetHeader>

        {/* بدنه سبد خرید */}
        {!hydrated || items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              سبد خرید شما خالی است
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
              مدل خودروی خود را انتخاب کنید و قطعات جلوبندی مورد نیازتان را با ضمانت اصالت به سبد اضافه نمایید.
            </p>
            <Button
              variant="accent"
              onClick={() => {
                setCartDrawerOpen(false);
                router.push("/products");
              }}
            >
              مشاهده کاتالوگ قطعات
            </Button>
          </div>
        ) : (
          <>
            {/* نوار پیشرفت ارسال رایگان */}
            <div className="px-4 pt-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-900">
                    <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                    {totals.isFreeShipping ? (
                      "سفارش شما شامل ارسال کاملاً رایگان شد!"
                    ) : (
                      <>
                        تنها{" "}
                        <strong className="text-emerald-700">
                          {formatPrice(totals.remainingForFreeShipping)}
                        </strong>{" "}
                        تا ارسال رایگان فاصله دارید!
                      </>
                    )}
                  </span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {formatNumber(totals.freeShippingProgress)}٪
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200/70">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${totals.freeShippingProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-800">
                  <span>مجموع فعلی: {formatPrice(totals.payableItemsTotal)}</span>
                  <span>
                    ارسال رایگان بالای {formatPrice(totals.freeShippingThreshold)}
                  </span>
                </div>
              </div>
            </div>

            {/* لیست اقلام سبد خرید */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => {
                const linePrice =
                  (item.effectivePrice || item.price) * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setCartDrawerOpen(false)}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                      >
                        <Image
                          src={item.image || "/images/products/suspension-pack.svg"}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1.5"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setCartDrawerOpen(false)}
                            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-accent transition-colors"
                          >
                            {item.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            aria-label="حذف کالا"
                            className="text-slate-400 hover:text-red-600 p-0.5 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <CompatibilityBadge
                            compatibleCarIds={item.compatibleCarIds}
                            showFallback={false}
                          />
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            {item.warranty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={item.stock || 99}
                        onChange={(qty) => updateQuantity(item.productId, qty)}
                        onRemove={() => removeItem(item.productId)}
                      />

                      <div className="text-left tabular-nums">
                        {isPriceUpdateMode ? (
                          <Badge variant="warning" className="text-[11px]">
                            در حال بروزرسانی قیمت
                          </Badge>
                        ) : (
                          <div>
                            <span className="text-sm font-black text-slate-900">
                              {formatNumber(linePrice)}
                            </span>{" "}
                            <span className="text-[11px] text-slate-500">تومان</span>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-slate-400">
                                (واحد: {formatPrice(item.effectivePrice || item.price)})
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* باکس اطلاع‌رسانی ارسال فوری */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>تحویل فوری زیر ۲ ساعت در تهران (ویژه خودرو روی جک تعمیرگاه)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>ضمانت اصالت کتبی فیزیکی و ۷ روز مهلت بازگشت بی‌قیدوشرط</span>
                </div>
              </div>
            </div>

            {/* فوتر چسبان جمع کل و دکمه پرداخت */}
            <div className="border-t border-slate-200 bg-white p-4 space-y-3 shadow-lg">
              {!isPriceUpdateMode && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>جمع کل اقلام ({formatNumber(totals.totalCount)} عدد):</span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatPrice(totals.subtotal)}
                    </span>
                  </div>

                  {totals.discountTotal > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>سود شما از تخفیف پکیج و حراج:</span>
                      <span className="tabular-nums">
                        {formatPrice(totals.discountTotal)}-
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>هزینه ارسال شهری / باربری:</span>
                    {totals.isFreeShipping ? (
                      <Badge variant="success" className="text-[11px]">
                        رایگان
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        محاسبه در مرحله تسویه‌حساب
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">
                        مبلغ قابل پرداخت:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        با احتساب کلیه کسورات و تخفیف نقدی
                      </span>
                    </div>
                    <div className="text-left tabular-nums">
                      <span className="text-xl font-black text-slate-900">
                        {formatNumber(totals.payableItemsTotal)}
                      </span>{" "}
                      <span className="text-xs font-medium text-slate-500">
                        تومان
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isPriceUpdateMode ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-amber-400 bg-amber-50 text-amber-900 font-bold"
                  asChild
                >
                  <a href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}>
                    <PhoneCall className="h-4 w-4" />
                    تماس جهت استعلام و ثبت تلفنی سفارش
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  onClick={handleCheckout}
                  className="w-full gap-2 font-black"
                >
                  <span>ادامه فرآیند خرید و تسویه‌حساب</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
