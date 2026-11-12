"use client";

import { PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { cn, formatNumber } from "@/lib/utils";

export function PriceTag({
  price,
  discountPrice,
  size = "md",
  className,
  showDiscountBadge = false,
}) {
  const { data: settings } = useSiteSettings();
  const isPriceUpdateMode = Boolean(settings?.priceUpdateMode);

  if (isPriceUpdateMode) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Badge variant="warning" className="gap-1 py-1 px-2 text-xs font-bold">
          <PhoneCall className="h-3.5 w-3.5" />
          در حال بروزرسانی قیمت
        </Badge>
      </div>
    );
  }

  const hasDiscount =
    discountPrice !== null &&
    discountPrice !== undefined &&
    Number(discountPrice) > 0 &&
    Number(discountPrice) < Number(price);

  const effectivePrice = hasDiscount ? Number(discountPrice) : Number(price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100)
    : 0;

  const sizeClasses = {
    sm: "text-sm sm:text-base font-black",
    md: "text-base sm:text-lg font-black",
    lg: "text-xl sm:text-2xl font-black",
  };

  return (
    <div className={cn("flex flex-col items-end text-left tabular-nums min-w-0", className)}>
      {hasDiscount && (
        <div className="flex items-center justify-end gap-1.5 mb-0.5 whitespace-nowrap">
          {showDiscountBadge && discountPercent > 0 && (
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shrink-0">
              {formatNumber(discountPercent)}٪
            </span>
          )}
          <span className="text-[11px] text-slate-400 line-through whitespace-nowrap">
            {formatNumber(price)}
          </span>
        </div>
      )}
      <div className="flex items-baseline justify-end gap-1 whitespace-nowrap">
        <span
          className={cn(
            "whitespace-nowrap",
            sizeClasses[size] || sizeClasses.md,
            hasDiscount ? "text-accent" : "text-slate-900"
          )}
        >
          {formatNumber(effectivePrice)}
        </span>
        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">تومان</span>
      </div>
    </div>
  );
}
