"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Search, X } from "lucide-react";
import { CompatibilityBadge } from "@/components/shared/compatibility-badge";
import { PriceTag } from "@/components/shared/price-tag";
import { useProducts } from "@/hooks/queries/use-products";
import { cn, formatNumber } from "@/lib/utils";

export function LiveSearch({ className, onNavigate }) {
  const router = useRouter();
  const containerRef = useRef(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setActiveIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shouldSearch = debouncedQuery.length >= 2;
  const { data: resultsData, isFetching } = useProducts(
    { q: debouncedQuery, pageSize: 5 },
    { enabled: shouldSearch }
  );

  const items = resultsData?.items || [];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      const selected = items[activeIndex];
      setIsOpen(false);
      onNavigate?.();
      router.push(`/products/${selected.slug}`);
      return;
    }
    if (query.trim()) {
      setIsOpen(false);
      onNavigate?.();
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || !shouldSearch) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full rounded-lg border border-slate-300 bg-slate-50/80 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/20 transition-all"
      >
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="جستجوی قطعه، کد فنی یا خودرو..."
          aria-label="جستجوی قطعات جلوبندی"
          className="h-10 w-full bg-transparent pr-3.5 pl-20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setIsOpen(false);
            }}
            aria-label="پاک کردن جستجو"
            className="absolute left-11 rounded p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          aria-label="جستجو"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-l-md bg-accent text-white hover:bg-brand-700 transition-colors"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* دراپ‌داون نتایج زنده */}
      {isOpen && shouldSearch && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {isFetching && items.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              در حال جستجو در انبار قطعات...
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              قطعه‌ای با عبارت «{debouncedQuery}» یافت نشد.
            </div>
          ) : (
            <div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {items.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 transition-colors hover:bg-slate-50",
                      activeIndex === idx && "bg-orange-50/70"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <Image
                          src={item.images?.[0] || "/images/products/suspension-pack.svg"}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                          <span>برند: {item.brand?.name}</span>
                          <span>•</span>
                          <span className="font-mono">{item.sku}</span>
                          <CompatibilityBadge
                            compatibleCarIds={item.compatibleCarIds}
                            compatibleCars={item.compatibleCars}
                            showFallback={false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <PriceTag
                        price={item.price}
                        discountPrice={item.discountPrice}
                        size="sm"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-2.5 text-center">
                <Link
                  href={`/products?q=${encodeURIComponent(debouncedQuery)}`}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-brand-700"
                >
                  <span>
                    مشاهده همه {formatNumber(resultsData?.total || items.length)} نتیجه برای «
                    {debouncedQuery}»
                  </span>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
