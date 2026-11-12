"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { useProducts } from "@/hooks/queries/use-products";
import { ProductCard } from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BundlesSection() {
  const { data, isLoading } = useProducts({
    onlyBundles: true,
    sort: "bestselling",
    pageSize: 8,
  });

  const bundles = data?.items || [];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    align: "start",
    loop: false,
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedSnap(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, bundles.length]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-12 md:py-16 bg-slate-950 text-white border-y border-slate-800 overflow-x-clip">
      <div className="container mx-auto px-4">
        <div className="border-r-4 border-accent pr-3 mb-6">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            پک‌های کامل آماده نصب
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مجموعه کامل قطعات جلوبندی با تطابق فنی و صرفه اقتصادی
          </p>
        </div>

        {/* محدوده خط‌کشی‌شده کاروسل بدون باکس اضافی */}
        <div className="relative py-6 border-y border-slate-800/90">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="اسلاید قبلی"
            className="hidden sm:flex items-center justify-center absolute right-2 lg:-right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-slate-900 border border-slate-700 text-white shadow-lg transition-colors hover:bg-accent hover:border-accent disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="اسلاید بعدی"
            className="hidden sm:flex items-center justify-center absolute left-2 lg:-left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-slate-900 border border-slate-700 text-white shadow-lg transition-colors hover:bg-accent hover:border-accent disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -mr-4">
                {bundles.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 pr-4"
                  >
                    <ProductCard
                      product={product}
                      className="h-full border-slate-800 hover:border-accent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {snapCount > 1 &&
              Array.from({ length: snapCount }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(idx)}
                  aria-label={`اسلاید ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    selectedSnap === idx
                      ? "w-6 bg-accent"
                      : "w-1.5 bg-slate-700 hover:bg-slate-500"
                  )}
                />
              ))}
          </div>

          <Button
            asChild
            variant="accent"
            size="sm"
            className="font-bold gap-1.5 px-4"
          >
            <Link href="/products?onlyBundles=true">
              <span>مشاهده تمامی پک‌های آماده جلوبندی</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
