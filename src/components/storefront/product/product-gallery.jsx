"use client";

import { useState } from "react";
import Image from "next/image";
import { Layers, Sparkles } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export function ProductGallery({
  images = [],
  title = "",
  discountPercent = 0,
  isBundle = false,
}) {
  const safeImages =
    images.length > 0 ? images : ["/images/products/suspension-pack.svg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const currentSrc = safeImages[activeIndex] || safeImages[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        {/* برچسب‌های گوشه تصویر */}
        <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
          {isBundle ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-white">
              <Layers className="h-3.5 w-3.5 text-orange-400" />
              پک کامل جلوبندی
            </span>
          ) : (
            <span />
          )}

          {discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-black text-white shadow-sm tabular-nums">
              <Sparkles className="h-3 w-3" />
              {formatNumber(discountPercent)}٪ تخفیف
            </span>
          )}
        </div>

        <Image
          src={currentSrc}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-contain p-6 sm:p-8"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {safeImages.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`نمایش تصویر ${formatNumber(idx + 1)}`}
                className={cn(
                  "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition-all",
                  active
                    ? "border-accent ring-2 ring-orange-100 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
                )}
              >
                <Image
                  src={img}
                  alt={`${title} - تصویر ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
