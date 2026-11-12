"use client";

import Link from "next/link";
import { CarFront } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/shared/section-header";
import { useCars } from "@/hooks/queries/use-catalog";
import { formatNumber } from "@/lib/utils";

export function CarFamiliesSection() {
  const { data: carsData, isLoading } = useCars();
  const families = carsData?.families || [];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <SectionHeader
        title="دسترسی سریع بر اساس مدل خودرو"
        subtitle="مشاهده تمام قطعات استاندارد طبق کاتالوگ فنی خط تولید"
        actionLabel="مشاهده تمامی خودروها"
        actionHref="/products"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <Skeleton className="h-11 w-11 rounded-xl mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-5 w-16 mx-auto rounded" />
              </div>
            ))
          : families.map((fam) => (
              <Link
                key={fam.id}
                href={`/products?car=${fam.id}`}
                className="group flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:border-accent hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-orange-50 group-hover:text-accent mb-3">
                  <CarFront className="h-6 w-6" />
                </div>

                <div className="space-y-1 mb-3">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-accent transition-colors">
                    {fam.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {fam.subtitle}
                  </p>
                </div>

                <Badge variant="secondary" className="text-[11px] font-bold">
                  {formatNumber(fam.productCount || 0)} قطعه موجود
                </Badge>
              </Link>
            ))}
      </div>
    </section>
  );
}
