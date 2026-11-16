import { Suspense } from "react";
import { CatalogView } from "@/components/storefront/catalog/catalog-view";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "کاتالوگ قطعات جلوبندی و سیستم تعلیق | یدک‌جلوبندی",
  description:
    "جستجو و فیلتر تخصصی قطعات جلوبندی، کمک‌فنر، طبق، سیبک و پک‌های کامل جلوبندی بر اساس خودرو، برند و موقعیت نصب.",
};

function CatalogLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-5 sm:py-7">
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="hidden lg:block lg:col-span-3">
          <Skeleton className="h-[540px] w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-9 space-y-5">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} horizontalOnMobile />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<CatalogLoadingFallback />}>
      <CatalogView />
    </Suspense>
  );
}
