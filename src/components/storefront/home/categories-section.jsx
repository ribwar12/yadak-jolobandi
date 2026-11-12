"use client";

import Link from "next/link";
import {
  Package,
  Wrench,
  CircleDot,
  ArrowUpDown,
  GitCommitHorizontal,
  Cog,
  MoveHorizontal,
  Disc,
  ChevronLeft,
} from "lucide-react";
import { useCategories } from "@/hooks/queries/use-catalog";
import { useCarStore } from "@/store/use-car-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { SectionHeader } from "@/components/shared/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

const CATEGORY_ICON_MAP = {
  Package,
  Wrench,
  CircleDot,
  ArrowUpDown,
  GitCommitHorizontal,
  Cog,
  MoveHorizontal,
  Disc,
};

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="دسته‌بندی تخصصی قطعات جلوبندی"
          subtitle="انتخاب سریع بر اساس نوع قطعه و گروه عملکردی در سیستم تعلیق و فرمان"
          actionLabel="مشاهده همه قطعات"
          actionHref="/products"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} className="h-28 sm:h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICON_MAP[cat.iconName] || Wrench;
              const href =
                hydrated && selectedCar?.id
                  ? `/products?category=${cat.slug}&car=${selectedCar.id}`
                  : `/products?category=${cat.slug}`;

              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="group relative flex flex-col justify-between p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  {/* گوشه‌های نارنجی کادر */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 right-0 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-tr-xl border-t-[3px] border-r-[3px] border-accent transition-all duration-200 group-hover:h-5 group-hover:w-5 sm:group-hover:h-6 sm:group-hover:w-6"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-bl-xl border-b-[3px] border-l-[3px] border-accent transition-all duration-200 group-hover:h-5 group-hover:w-5 sm:group-hover:h-6 sm:group-hover:w-6"
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-100 group-hover:bg-orange-50 text-slate-700 group-hover:text-accent flex items-center justify-center transition-colors shrink-0">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-slate-100 text-slate-600 whitespace-nowrap">
                      {formatNumber(cat.productCount || 0)} کالا
                    </span>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-accent transition-colors leading-snug">
                        {cat.name}
                      </h3>
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-accent group-hover:-translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
