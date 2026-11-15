"use client";

import { useEffect, useState } from "react";
import { CarFront, FilterX, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn, formatNumber } from "@/lib/utils";
import { useCarStore } from "@/store/use-car-store";
import { useUiStore } from "@/store/use-ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

export const CATALOG_PRICE_MIN = 0;
export const CATALOG_PRICE_MAX = 8000000;
export const CATALOG_PRICE_STEP = 100000;

export const POSITION_OPTIONS = [
  { value: "", label: "همه موقعیت‌ها" },
  { value: "محور جلو", label: "محور جلو (چپ و راست)" },
  { value: "جلو راست", label: "جلو راست (سمت شاگرد)" },
  { value: "جلو چپ", label: "جلو چپ (سمت راننده)" },
  { value: "مجموعه فرمان", label: "مجموعه و جعبه فرمان" },
  { value: "اکسل عقب", label: "اکسل و محور عقب" },
];

export function FilterSidebar({
  filters,
  carsData,
  categories = [],
  brands = [],
  onUpdateFilters,
  onResetFilters,
  hasActiveFilters,
  className,
}) {
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);
  const openCarSelector = useUiStore((s) => s.openCarSelector);

  const [priceRange, setPriceRange] = useState([
    filters.minPrice ?? CATALOG_PRICE_MIN,
    filters.maxPrice ?? CATALOG_PRICE_MAX,
  ]);

  useEffect(() => {
    setPriceRange([
      filters.minPrice ?? CATALOG_PRICE_MIN,
      filters.maxPrice ?? CATALOG_PRICE_MAX,
    ]);
  }, [filters.minPrice, filters.maxPrice]);

  const toggleMultiValue = (currentList, value) => {
    const exists = currentList.includes(value);
    const next = exists
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];
    return next;
  };

  const commitPriceRange = (range) => {
    const [minVal, maxVal] = range;
    onUpdateFilters({
      minPrice: minVal > CATALOG_PRICE_MIN ? minVal : null,
      maxPrice: maxVal < CATALOG_PRICE_MAX ? maxVal : null,
    });
  };

  const families = carsData?.families || [];

  return (
    <aside
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <h2 className="text-sm font-black text-slate-900">فیلترهای تخصصی</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <FilterX className="h-3.5 w-3.5" />
            <span>حذف فیلترها</span>
          </button>
        )}
      </div>

      {/* سوییچ‌های سریع موجودی و پک کامل */}
      <div className="space-y-3 py-3 border-b border-slate-100">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-bold text-slate-700">
            فقط کالاهای موجود در انبار
          </span>
          <Switch
            checked={Boolean(filters.inStock)}
            onCheckedChange={(checked) =>
              onUpdateFilters({ inStock: checked ? "true" : null })
            }
          />
        </label>

        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-xs font-bold text-slate-700">
            فقط پک‌های کامل جلوبندی
          </span>
          <Switch
            checked={Boolean(filters.onlyBundles)}
            onCheckedChange={(checked) =>
              onUpdateFilters({ onlyBundles: checked ? "true" : null })
            }
          />
        </label>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["car", "category", "brand", "price"]}
        className="w-full"
      >
        {/* فیلتر خودرو */}
        <AccordionItem value="car">
          <AccordionTrigger className="text-xs sm:text-sm font-extrabold">
            خودروی سازگار
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5">
            {hydrated && selectedCar && (
              <button
                type="button"
                onClick={() =>
                  onUpdateFilters({
                    car: filters.car === selectedCar.id ? "all" : selectedCar.id,
                  })
                }
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs font-bold transition-colors",
                  filters.car === selectedCar.id
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-accent"
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <CarFront className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">خودروی من: {selectedCar.name}</span>
                </span>
                <span className="text-[10px] shrink-0">
                  {filters.car === selectedCar.id ? "فعال" : "انتخاب"}
                </span>
              </button>
            )}

            <select
              aria-label="انتخاب مدل یا خانواده خودرو"
              value={filters.car || ""}
              onChange={(e) =>
                onUpdateFilters({
                  car: e.target.value ? e.target.value : "all",
                })
              }
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 text-xs font-medium text-slate-900 focus:border-accent focus:bg-white focus:outline-none"
            >
              <option value="">همه خودروها (بدون محدودیت)</option>
              {families.map((fam) => (
                <optgroup key={fam.id} label={fam.name}>
                  <option value={fam.id}>کل خانواده {fam.name}</option>
                  {fam.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({formatNumber(model.productCount || 0)})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button
              type="button"
              onClick={openCarSelector}
              className="text-[11px] font-bold text-accent hover:underline"
            >
              تغییر یا انتخاب دقیق خودرو در گاراژ من ←
            </button>
          </AccordionContent>
        </AccordionItem>

        {/* فیلتر دسته‌بندی */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-xs sm:text-sm font-extrabold">
            دسته‌بندی قطعات
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 max-h-60 overflow-y-auto pl-1">
            {categories.map((cat) => {
              const checked = filters.categories.includes(cat.slug);
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between gap-2 text-xs cursor-pointer group"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        const next = toggleMultiValue(filters.categories, cat.slug);
                        onUpdateFilters({
                          category: next.length > 0 ? next.join(",") : null,
                        });
                      }}
                    />
                    <span
                      className={cn(
                        "truncate transition-colors",
                        checked
                          ? "font-bold text-slate-900"
                          : "text-slate-600 group-hover:text-slate-900"
                      )}
                    >
                      {cat.name}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                    ({formatNumber(cat.productCount || 0)})
                  </span>
                </label>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* فیلتر برند */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-xs sm:text-sm font-extrabold">
            برند و سازنده قطعه
          </AccordionTrigger>
          <AccordionContent className="space-y-2.5 max-h-56 overflow-y-auto pl-1">
            {brands.map((brand) => {
              const checked = filters.brands.includes(brand.slug);
              return (
                <label
                  key={brand.id}
                  className="flex items-center justify-between gap-2 text-xs cursor-pointer group"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        const next = toggleMultiValue(filters.brands, brand.slug);
                        onUpdateFilters({
                          brand: next.length > 0 ? next.join(",") : null,
                        });
                      }}
                    />
                    <span
                      className={cn(
                        "truncate transition-colors",
                        checked
                          ? "font-bold text-slate-900"
                          : "text-slate-600 group-hover:text-slate-900"
                      )}
                    >
                      {brand.name}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                    ({formatNumber(brand.productCount || 0)})
                  </span>
                </label>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* فیلتر محدوده قیمت */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-xs sm:text-sm font-extrabold">
            محدوده قیمت (تومان)
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Slider
              min={CATALOG_PRICE_MIN}
              max={CATALOG_PRICE_MAX}
              step={CATALOG_PRICE_STEP}
              value={priceRange}
              onValueChange={setPriceRange}
              onValueCommit={commitPriceRange}
            />

            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 tabular-nums">
              <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 flex-1 text-center">
                از <strong className="text-slate-900">{formatNumber(priceRange[0])}</strong>
              </div>
              <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 flex-1 text-center">
                تا <strong className="text-slate-900">{formatNumber(priceRange[1])}</strong>
              </div>
            </div>

            {(filters.minPrice !== null || filters.maxPrice !== null) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onUpdateFilters({ minPrice: null, maxPrice: null })}
                className="h-7 w-full text-xs text-slate-500 hover:text-red-600 gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                بازنشانی محدوده قیمت
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* فیلتر موقعیت نصب */}
        <AccordionItem value="position" className="border-b-0">
          <AccordionTrigger className="text-xs sm:text-sm font-extrabold">
            موقعیت نصب روی خودرو
          </AccordionTrigger>
          <AccordionContent className="space-y-1.5">
            {POSITION_OPTIONS.map((opt) => {
              const active = (filters.position || "") === opt.value;
              return (
                <button
                  key={opt.value || "all-pos"}
                  type="button"
                  onClick={() =>
                    onUpdateFilters({ position: opt.value || null })
                  }
                  className={cn(
                    "w-full text-right rounded-lg px-2.5 py-1.5 text-xs transition-colors border",
                    active
                      ? "bg-orange-50 border-orange-200 text-accent font-bold"
                      : "bg-white border-transparent text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
