"use client";

import Image from "next/image";
import Link from "next/link";
import { PackageCheck, PhoneCall, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityBadge } from "@/components/shared/compatibility-badge";
import { PriceTag } from "@/components/shared/price-tag";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

export function ProductCard({ product, className, horizontalOnMobile = false }) {
  const addItem = useCartStore((s) => s.addItem);
  const { data: settings } = useSiteSettings();

  if (!product) return null;

  const isPriceUpdateMode = Boolean(settings?.priceUpdateMode);
  const isOutOfStock = Number(product.stock) <= 0;
  const imageSrc = product.images?.[0] || "/images/products/suspension-pack.svg";

  return (
    <div
      className={cn(
        "group relative flex justify-between rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md",
        horizontalOnMobile
          ? "flex-row sm:flex-col gap-3 sm:gap-0 p-3 sm:p-3.5"
          : "flex-col p-3.5",
        className
      )}
    >
      {/* تصویر محصول */}
      <Link
        href={`/products/${product.slug}`}
        className={cn(
          "relative block overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50",
          horizontalOnMobile
            ? "w-28 h-28 shrink-0 self-center sm:self-stretch sm:w-full sm:h-auto sm:aspect-square mb-0 sm:mb-3"
            : "aspect-square w-full mb-3"
        )}
      >
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes={
            horizontalOnMobile
              ? "(max-width: 640px) 112px, (max-width: 1200px) 50vw, 25vw"
              : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          }
          className={cn(
            "object-contain transition-transform duration-300 group-hover:scale-105",
            horizontalOnMobile ? "p-2 sm:p-4" : "p-4"
          )}
        />

        <div
          className={cn(
            "absolute bottom-2 right-2 left-2 items-center pointer-events-none",
            horizontalOnMobile ? "hidden sm:flex" : "flex"
          )}
        >
          <CompatibilityBadge
            compatibleCarIds={product.compatibleCarIds}
            compatibleCars={product.compatibleCars}
            showFallback={false}
          />
        </div>
      </Link>

      {/* جزئیات متنی و قیمت */}
      <div className="flex flex-1 min-w-0 flex-col justify-between">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            {isOutOfStock ? (
              <span className="font-bold text-red-600">ناموجود در انبار</span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <PackageCheck className="h-3.5 w-3.5 shrink-0" />
                موجود در انبار
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className={cn(
              "block font-bold text-slate-900 leading-snug line-clamp-2 hover:text-accent transition-colors",
              horizontalOnMobile
                ? "text-[13px] sm:text-sm sm:min-h-[2.6rem]"
                : "text-sm min-h-[2.6rem]"
            )}
          >
            {product.title}
          </Link>

          {horizontalOnMobile && (
            <div className="sm:hidden pt-0.5 empty:hidden">
              <CompatibilityBadge
                compatibleCarIds={product.compatibleCarIds}
                compatibleCars={product.compatibleCars}
                showFallback={false}
                className="max-w-full truncate text-[10px] px-1.5 py-0.5"
              />
            </div>
          )}
        </div>

        {/* قیمت و دکمه افزودن به سبد */}
        <div
          className={cn(
            "border-t border-slate-100 flex items-center justify-between gap-2",
            horizontalOnMobile
              ? "mt-2.5 pt-2 sm:mt-4 sm:pt-3"
              : "mt-4 pt-3"
          )}
        >
          {isPriceUpdateMode ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs"
              asChild
            >
              <a href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}>
                <PhoneCall className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                تماس جهت استعلام قیمت
              </a>
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant={isOutOfStock ? "secondary" : "accent"}
                size="sm"
                disabled={isOutOfStock}
                onClick={() => addItem(product, 1)}
                className="h-8 gap-1 px-2 sm:px-2.5 text-[11px] sm:text-xs font-bold shrink-0"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {horizontalOnMobile ? (
                  <>
                    <span className="sm:hidden">
                      {isOutOfStock ? "ناموجود" : "افزودن"}
                    </span>
                    <span className="hidden sm:inline">
                      {isOutOfStock ? "ناموجود" : "افزودن به سبد"}
                    </span>
                  </>
                ) : (
                  <span>{isOutOfStock ? "ناموجود" : "افزودن به سبد"}</span>
                )}
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
