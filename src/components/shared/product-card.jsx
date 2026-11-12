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

export function ProductCard({ product, className }) {
  const addItem = useCartStore((s) => s.addItem);
  const { data: settings } = useSiteSettings();

  if (!product) return null;

  const isPriceUpdateMode = Boolean(settings?.priceUpdateMode);
  const isOutOfStock = Number(product.stock) <= 0;
  const imageSrc = product.images?.[0] || "/images/products/suspension-pack.svg";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md",
        className
      )}
    >
      <div>
        {/* تصویر محصول بدون شلوغی اضافی */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-square w-full overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50 mb-3"
        >
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute bottom-2 right-2 left-2 flex items-center pointer-events-none">
            <CompatibilityBadge
              compatibleCarIds={product.compatibleCarIds}
              compatibleCars={product.compatibleCars}
            />
          </div>
        </Link>

        {/* وضعیت موجودی و عنوان */}
        <div className="space-y-2">
          <div className="flex items-center text-[11px]">
            {isOutOfStock ? (
              <span className="font-bold text-red-600">ناموجود در انبار</span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <PackageCheck className="h-3.5 w-3.5" />
                موجود در انبار
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="block text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-accent transition-colors min-h-[2.6rem]"
          >
            {product.title}
          </Link>
        </div>
      </div>

      {/* قیمت و دکمه افزودن به سبد */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {isPriceUpdateMode ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
            asChild
          >
            <a href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}>
              <PhoneCall className="h-4 w-4" />
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
              className="h-8 gap-1 px-2.5 text-xs font-bold shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{isOutOfStock ? "ناموجود" : "افزودن به سبد"}</span>
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
  );
}
