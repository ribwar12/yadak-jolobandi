"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronLeft,
  MapPin,
  PackageCheck,
  PackageSearch,
  PhoneCall,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PriceTag } from "@/components/shared/price-tag";
import { ProductCard } from "@/components/shared/product-card";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductGallery } from "@/components/storefront/product/product-gallery";
import { LiveCompatibilityBox } from "@/components/storefront/product/live-compatibility-box";
import { ProductDetailTabs } from "@/components/storefront/product/product-detail-tabs";
import { useProductDetail } from "@/hooks/queries/use-products";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/use-cart-store";
import { formatNumber } from "@/lib/utils";

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <Skeleton className="h-5 w-72" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-5 space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2.5">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-16 w-16 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function ProductDetailView({ slug }) {
  const hydrated = useHydrated();
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError } = useProductDetail(slug);
  const { data: settings } = useSiteSettings();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !data?.product) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          icon={PackageSearch}
          title="قطعه مورد نظر در کاتالوگ یافت نشد"
          description="ممکن است شناسه محصول تغییر کرده باشد یا این قطعه موقتاً از فروشگاه حذف شده باشد."
          actionLabel="بازگشت به کاتالوگ قطعات"
          actionHref="/products"
          className="rounded-2xl border border-slate-200 bg-white py-16"
        />
      </div>
    );
  }

  const { product, compatibilityMatrix = [], relatedProducts = [] } = data;
  const isPriceUpdateMode = Boolean(settings?.priceUpdateMode);
  const stockCount = Math.max(0, Number(product.stock) || 0);
  const isOutOfStock = stockCount <= 0;
  const clampedQty = Math.min(Math.max(1, qty), Math.max(1, stockCount));

  const inCartItem = hydrated
    ? cartItems.find((item) => item.productId === product.id)
    : null;

  const handleAddToCart = () => {
    if (isOutOfStock || isPriceUpdateMode) return;
    addItem(product, clampedQty);
  };

  return (
    <div className="container mx-auto px-4 py-5 sm:py-7 pb-24 lg:pb-10 space-y-8 sm:space-y-10">
      {/* نان‌ریزه (Breadcrumb) */}
      <nav
        aria-label="مسیر صفحه محصول"
        className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
      >
        <Link href="/" className="hover:text-accent transition-colors">
          خانه
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-accent transition-colors">
          کاتالوگ قطعات
        </Link>
        {product.category && (
          <>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-accent transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-slate-800 line-clamp-1">
          {product.title}
        </span>
      </nav>

      {/* بخش اصلی گالری + مشخصات خرید */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* گالری تصاویر */}
        <div className="lg:col-span-5">
          <ProductGallery
            images={product.images}
            title={product.title}
            discountPercent={product.discountPercent}
            isBundle={product.isBundle}
          />
        </div>

        {/* اطلاعات، سازگاری و باکس خرید */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-3">
            {/* تگ‌های برند و کد فنی */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {product.brand && (
                <Link
                  href={`/products?brand=${product.brand.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-bold text-slate-800 hover:border-accent hover:text-accent transition-colors"
                >
                  {product.brand.isOriginalCompany && (
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                  )}
                  برند: {product.brand.name}
                </Link>
              )}

              <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
                SKU: {product.sku}
              </span>

              {isOutOfStock ? (
                <span className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 font-bold text-red-700">
                  ناموجود در انبار
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-bold text-emerald-700 tabular-nums">
                  <PackageCheck className="h-3.5 w-3.5" />
                  موجود ({formatNumber(stockCount)} عدد آماده ارسال)
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* باکس بررسی زنده سازگاری با خودروی من */}
          <LiveCompatibilityBox
            compatibleCarIds={product.compatibleCarIds}
            compatibleCars={product.compatibleCars}
            position={product.position}
          />

          {/* کارت خرید و قیمت */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
            {isPriceUpdateMode ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed">
                  به دلیل نوسانات لحظه‌ای نرخ ارز و بازار قطعات، فروش آنلاین موقتاً متوقف شده است. برای دریافت قیمت روز و ثبت سفارش تلفنی تماس بگیرید.
                </div>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-bold"
                  asChild
                >
                  <a href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}>
                    <PhoneCall className="h-4 w-4" />
                    تماس با واحد فروش: {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    قیمت مصرف‌کننده با ضمانت اصالت:
                  </span>
                  <PriceTag
                    price={product.price}
                    discountPrice={product.discountPrice}
                    size="lg"
                    showDiscountBadge
                    className="items-start text-right"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!isOutOfStock && (
                    <QuantityStepper
                      value={clampedQty}
                      min={1}
                      max={stockCount}
                      onChange={setQty}
                    />
                  )}

                  <Button
                    type="button"
                    variant={isOutOfStock ? "secondary" : "accent"}
                    size="lg"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="flex-1 sm:flex-initial gap-2 px-6 font-extrabold shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>
                      {isOutOfStock
                        ? "ناموجود در انبار"
                        : inCartItem
                          ? "افزودن بیشتر به سبد خرید"
                          : "افزودن به سبد خرید"}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {inCartItem && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between gap-2">
                <span>
                  هم‌اکنون{" "}
                  <strong className="text-accent tabular-nums">
                    {formatNumber(inCartItem.quantity)} عدد
                  </strong>{" "}
                  از این کالا در سبد خرید شماست.
                </span>
              </div>
            )}

            {/* تضمین‌ها و موقعیت */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold line-clamp-1">
                  {product.warranty}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span className="font-semibold line-clamp-1">
                  {product.position || "محور جلو"}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                <Truck className="h-4 w-4 text-sky-600 shrink-0" />
                <span className="font-semibold line-clamp-1">
                  ارسال سریع از انبار چراغ‌برق
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* تب‌های اقلام پک، مشخصات فنی و جدول سازگاری */}
      <ProductDetailTabs
        product={product}
        compatibilityMatrix={compatibilityMatrix}
      />

      {/* محصولات مرتبط و تکمیلی */}
      {relatedProducts.length > 0 && (
        <section className="pt-2">
          <SectionHeader
            title="قطعات مرتبط و پیشنهادی"
            subtitle="سایر قطعات سازگار و مکمل سیستم تعلیق خودرو"
            actionLabel="مشاهده همه در کاتالوگ"
            actionHref={
              product.category?.slug
                ? `/products?category=${product.category.slug}`
                : "/products"
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                horizontalOnMobile
              />
            ))}
          </div>
        </section>
      )}

      {/* نوار چسبان خرید در موبایل */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          {isPriceUpdateMode ? (
            <Button
              variant="accent"
              size="sm"
              className="w-full gap-2 font-bold h-10"
              asChild
            >
              <a href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}>
                <PhoneCall className="h-4 w-4" />
                استعلام قیمت: {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
              </a>
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant={isOutOfStock ? "secondary" : "accent"}
                size="sm"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="h-10 gap-1.5 px-4 text-xs font-extrabold shrink-0"
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? "ناموجود" : "افزودن به سبد"}
              </Button>
              <PriceTag
                price={product.price}
                discountPrice={product.discountPrice}
                size="sm"
                showDiscountBadge
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
