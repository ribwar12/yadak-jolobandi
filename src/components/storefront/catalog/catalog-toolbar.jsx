"use client";

import Link from "next/link";
import {
  ArrowUpDown,
  CarFront,
  ChevronLeft,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useCarStore } from "@/store/use-car-store";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  CATALOG_PRICE_MAX,
  CATALOG_PRICE_MIN,
} from "@/components/storefront/catalog/filter-sidebar";

const SORT_OPTIONS = [
  { value: "bestselling", label: "پرفروش‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
];

export function CatalogToolbar({
  filters,
  total = 0,
  carsData,
  categories = [],
  brands = [],
  onUpdateFilters,
  onResetFilters,
  onOpenMobileFilters,
  activeFilterCount = 0,
}) {
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);

  const allCars = carsData?.cars || [];
  const allFamilies = carsData?.families || [];

  const matchedFamily = allFamilies.find((f) => f.id === filters.car);
  const matchedCarModel = allCars.find((c) => c.id === filters.car);
  const activeCarLabel = matchedFamily
    ? matchedFamily.name
    : matchedCarModel?.name || null;

  const activeCategoryLabels = filters.categories.map((slug) => {
    const found = categories.find((c) => c.slug === slug || c.id === slug);
    return { slug, label: found ? found.name : slug };
  });

  const activeBrandLabels = filters.brands.map((slug) => {
    const found = brands.find((b) => b.slug === slug || b.id === slug);
    return { slug, label: found ? found.name : slug };
  });

  const pageTitle =
    activeCategoryLabels.length === 1 && !activeCarLabel
      ? activeCategoryLabels[0].label
      : activeCarLabel
        ? `قطعات جلوبندی ${activeCarLabel}`
        : filters.onlyBundles
          ? "پک‌های کامل آماده جلوبندی"
          : "کاتالوگ قطعات تخصصی جلوبندی";

  const chips = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `جستجو: ${filters.q}`,
      onRemove: () => onUpdateFilters({ q: null }),
    });
  }

  if (activeCarLabel) {
    chips.push({
      key: "car",
      label: `خودرو: ${activeCarLabel}`,
      onRemove: () => onUpdateFilters({ car: "all" }),
    });
  }

  activeCategoryLabels.forEach((cat) => {
    chips.push({
      key: `cat-${cat.slug}`,
      label: `دسته: ${cat.label}`,
      onRemove: () => {
        const next = filters.categories.filter((s) => s !== cat.slug);
        onUpdateFilters({ category: next.length > 0 ? next.join(",") : null });
      },
    });
  });

  activeBrandLabels.forEach((brand) => {
    chips.push({
      key: `brand-${brand.slug}`,
      label: `برند: ${brand.label}`,
      onRemove: () => {
        const next = filters.brands.filter((s) => s !== brand.slug);
        onUpdateFilters({ brand: next.length > 0 ? next.join(",") : null });
      },
    });
  });

  if (filters.inStock) {
    chips.push({
      key: "inStock",
      label: "فقط موجود در انبار",
      onRemove: () => onUpdateFilters({ inStock: null }),
    });
  }

  if (filters.onlyBundles) {
    chips.push({
      key: "onlyBundles",
      label: "فقط پک‌های کامل",
      onRemove: () => onUpdateFilters({ onlyBundles: null }),
    });
  }

  if (filters.position) {
    chips.push({
      key: "position",
      label: `موقعیت: ${filters.position}`,
      onRemove: () => onUpdateFilters({ position: null }),
    });
  }

  if (
    (filters.minPrice !== null && filters.minPrice > CATALOG_PRICE_MIN) ||
    (filters.maxPrice !== null && filters.maxPrice < CATALOG_PRICE_MAX)
  ) {
    const minTxt = formatNumber(filters.minPrice ?? CATALOG_PRICE_MIN);
    const maxTxt = formatNumber(filters.maxPrice ?? CATALOG_PRICE_MAX);
    chips.push({
      key: "price",
      label: `قیمت: ${minTxt} تا ${maxTxt} تومان`,
      onRemove: () => onUpdateFilters({ minPrice: null, maxPrice: null }),
    });
  }

  return (
    <div className="space-y-3 mb-5">
      {/* نان‌ریزه */}
      <nav
        aria-label="مسیر راهنما"
        className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap"
      >
        <Link href="/" className="hover:text-accent transition-colors">
          خانه
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
        <Link href="/products?car=all" className="hover:text-accent transition-colors">
          کاتالوگ قطعات
        </Link>
        {activeCarLabel && (
          <>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">{activeCarLabel}</span>
          </>
        )}
      </nav>

      {/* بنر خودروی من در صورت انتخاب ولی غیرفعال بودن فیلتر */}
      {hydrated && selectedCar && filters.car !== selectedCar.id && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/70 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <CarFront className="h-4 w-4 text-accent shrink-0" />
            <span>
              خودروی ذخیره‌شده شما <strong>{selectedCar.name}</strong> است. می‌خواهید فقط قطعات سازگار را ببینید؟
            </span>
          </div>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={() => onUpdateFilters({ car: selectedCar.id })}
            className="h-7 px-3 text-xs font-bold self-start sm:self-auto shrink-0"
          >
            فیلتر برای {selectedCar.name}
          </Button>
        </div>
      )}

      {/* نوار عنوان و مرتب‌سازی */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-xl font-black text-slate-900">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {formatNumber(total)} کالا مطابق فیلترهای شما یافت شد
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* دکمه فیلتر موبایل */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilters}
            className="lg:hidden gap-1.5 h-9 font-bold border-slate-300"
          >
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            <span>فیلترها</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-black text-white">
                {formatNumber(activeFilterCount)}
              </span>
            )}
          </Button>

          {/* مرتب‌سازی */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-slate-600">
              <ArrowUpDown className="h-3.5 w-3.5" />
              مرتب‌سازی:
            </span>
            <select
              aria-label="مرتب‌سازی محصولات"
              value={filters.sort || "bestselling"}
              onChange={(e) => onUpdateFilters({ sort: e.target.value })}
              className="h-9 rounded-lg border border-slate-300 bg-slate-50 px-2.5 text-xs font-bold text-slate-800 focus:border-accent focus:bg-white focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* چیپ‌های فیلتر فعال */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <span>{chip.label}</span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}

          {chips.length > 1 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-red-600 hover:underline px-1.5"
            >
              پاک‌کردن همه
            </button>
          )}
        </div>
      )}
    </div>
  );
}
