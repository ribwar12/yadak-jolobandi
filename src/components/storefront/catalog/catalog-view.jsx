"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/storefront/catalog/filter-sidebar";
import { CatalogToolbar } from "@/components/storefront/catalog/catalog-toolbar";
import { CatalogPagination } from "@/components/storefront/catalog/pagination";
import { useProducts } from "@/hooks/queries/use-products";
import {
  useBrands,
  useCars,
  useCategories,
} from "@/hooks/queries/use-catalog";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCarStore } from "@/store/use-car-store";
import { cn } from "@/lib/utils";

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => {
    const urlCar = searchParams.get("car") || "";
    const onlyBundles = searchParams.get("onlyBundles") === "true";
    const effectiveCar =
      urlCar === "all"
        ? ""
        : urlCar || (hydrated && selectedCar?.id && !onlyBundles ? selectedCar.id : "");

    const categoriesRaw = searchParams.get("category") || "";
    const brandsRaw = searchParams.get("brand") || "";
    const minRaw = searchParams.get("minPrice");
    const maxRaw = searchParams.get("maxPrice");
    const parsedPage = Number(searchParams.get("page")) || 1;

    return {
      q: searchParams.get("q") || "",
      car: effectiveCar,
      categories: categoriesRaw ? categoriesRaw.split(",").filter(Boolean) : [],
      brands: brandsRaw ? brandsRaw.split(",").filter(Boolean) : [],
      inStock: searchParams.get("inStock") === "true",
      onlyBundles,
      position: searchParams.get("position") || "",
      minPrice:
        minRaw !== null && minRaw !== "" && !Number.isNaN(Number(minRaw))
          ? Number(minRaw)
          : null,
      maxPrice:
        maxRaw !== null && maxRaw !== "" && !Number.isNaN(Number(maxRaw))
          ? Number(maxRaw)
          : null,
      sort: searchParams.get("sort") || "bestselling",
      page: parsedPage >= 1 ? parsedPage : 1,
    };
  }, [searchParams, hydrated, selectedCar?.id]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.q) count += 1;
    if (filters.car) count += 1;
    count += filters.categories.length;
    count += filters.brands.length;
    if (filters.inStock) count += 1;
    if (filters.onlyBundles) count += 1;
    if (filters.position) count += 1;
    if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const { data: carsData } = useCars();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const { data: productsData, isLoading, isFetching } = useProducts({
    q: filters.q || undefined,
    car: filters.car || undefined,
    category:
      filters.categories.length > 0 ? filters.categories.join(",") : undefined,
    brand: filters.brands.length > 0 ? filters.brands.join(",") : undefined,
    inStock: filters.inStock ? "true" : undefined,
    onlyBundles: filters.onlyBundles ? "true" : undefined,
    position: filters.position || undefined,
    minPrice: filters.minPrice !== null ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice !== null ? filters.maxPrice : undefined,
    sort: filters.sort || "bestselling",
    page: filters.page || 1,
    pageSize: 12,
  });

  const updateFilters = (patch) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const hasNonPageUpdate = Object.keys(patch).some((key) => key !== "page");

    if (hasNonPageUpdate) {
      nextParams.delete("page");
    }

    Object.entries(patch).forEach(([key, value]) => {
      if (key === "car" && value === "all" && !(hydrated && selectedCar?.id)) {
        nextParams.delete("car");
        return;
      }

      if (
        value === null ||
        value === undefined ||
        value === "" ||
        (key === "page" && Number(value) <= 1) ||
        (key === "sort" && value === "bestselling")
      ) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const resetFilters = () => {
    if (hydrated && selectedCar?.id) {
      router.push(`${pathname}?car=all`, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (nextPage) => {
    updateFilters({ page: nextPage });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const items = productsData?.items || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;
  const currentPage = productsData?.page || filters.page;

  return (
    <div className="container mx-auto px-4 py-5 sm:py-7">
      <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        {/* سایدبار فیلتر دسکتاپ */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-36">
          <FilterSidebar
            filters={filters}
            carsData={carsData}
            categories={categories}
            brands={brands}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            className="max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain"
          />
        </div>

        {/* ستون اصلی محصولات و نوار ابزار */}
        <div className="lg:col-span-9 space-y-5">
          <CatalogToolbar
            filters={filters}
            total={total}
            carsData={carsData}
            categories={categories}
            brands={brands}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} horizontalOnMobile />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="قطعه‌ای با این فیلترها یافت نشد"
              description="برخی فیلترها را تغییر دهید یا تمام فیلترها را پاک کنید تا قطعات موجود نمایش داده شوند."
              actionLabel={hasActiveFilters ? "پاک‌کردن همه فیلترها" : undefined}
              onAction={hasActiveFilters ? resetFilters : undefined}
              className="rounded-2xl border border-slate-200 bg-white py-16"
            />
          ) : (
            <>
              <div
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4 transition-opacity",
                  isFetching && "opacity-70"
                )}
              >
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    horizontalOnMobile
                  />
                ))}
              </div>

              <CatalogPagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* کشوی فیلتر موبایل و تبلت */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="right"
          className="w-[88%] max-w-sm overflow-y-auto p-4 bg-slate-50"
        >
          <SheetHeader className="pb-3 mb-3 border-b border-slate-200 text-right">
            <SheetTitle className="text-base font-black text-slate-900">
              فیلترهای تخصصی
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              نتایج را بر اساس خودرو، دسته قطعه، برند و قیمت محدود کنید.
            </SheetDescription>
          </SheetHeader>

          <FilterSidebar
            filters={filters}
            carsData={carsData}
            categories={categories}
            brands={brands}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            className="border-0 shadow-none p-0 bg-transparent"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
