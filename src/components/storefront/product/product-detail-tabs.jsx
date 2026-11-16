"use client";

import { CheckCircle2, FileSpreadsheet, Layers, ShieldCheck, XCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCarStore } from "@/store/use-car-store";
import { cn, formatNumber } from "@/lib/utils";

export function ProductDetailTabs({ product, compatibilityMatrix = [] }) {
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);

  const hasBundleItems =
    Boolean(product?.isBundle) &&
    Array.isArray(product?.bundleItems) &&
    product.bundleItems.length > 0;

  const defaultTab = hasBundleItems ? "bundle" : "specs";

  const baseSpecs = [
    { label: "کد فنی (SKU)", value: product.sku, mono: true },
    product.brand?.name && {
      label: "برند / سازنده",
      value: `${product.brand.name}${
        product.brand.country ? ` (${product.brand.country})` : ""
      }`,
    },
    product.category?.name && {
      label: "دسته‌بندی",
      value: product.category.name,
    },
    product.position && { label: "موقعیت نصب", value: product.position },
    product.warranty && { label: "گارانتی و ضمانت", value: product.warranty },
  ].filter(Boolean);

  const allSpecs = [...baseSpecs, ...(product.specifications || [])];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <Tabs defaultValue={defaultTab} dir="rtl">
        <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl">
          {hasBundleItems && (
            <TabsTrigger value="bundle" className="gap-1.5 text-xs sm:text-sm">
              <Layers className="h-4 w-4 text-accent" />
              اقلام داخل پک ({formatNumber(product.bundleItems.length)} مورد)
            </TabsTrigger>
          )}
          <TabsTrigger value="specs" className="gap-1.5 text-xs sm:text-sm">
            <FileSpreadsheet className="h-4 w-4 text-accent" />
            مشخصات فنی
          </TabsTrigger>
          <TabsTrigger value="compatibility" className="gap-1.5 text-xs sm:text-sm">
            <ShieldCheck className="h-4 w-4 text-accent" />
            جدول سازگاری خودرویی ({formatNumber(compatibilityMatrix.length)})
          </TabsTrigger>
        </TabsList>

        {hasBundleItems && (
          <TabsContent value="bundle" className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  لیست کامل قطعات موجود در این پک
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تمام اقلام این پکیج به‌صورت هم‌تراز و بدون نیاز به خرید قطعه‌ای جداگانه آماده نصب هستند.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-bold text-accent self-start">
                بسته‌بندی پلمپ کارخانه‌ای
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {product.bundleItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-3 text-xs sm:text-sm"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-700 mt-0.5 tabular-nums">
                    {formatNumber(idx + 1)}
                  </span>
                  <span className="font-semibold text-slate-800 leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="specs" className="mt-5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 mb-3">
            مشخصات فنی و استانداردهای قطعه
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
            {allSpecs.map((spec, idx) => (
              <div
                key={`${spec.label}-${idx}`}
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm",
                  idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"
                )}
              >
                <div className="font-bold text-slate-600">{spec.label}</div>
                <div
                  className={cn(
                    "sm:col-span-2 font-semibold text-slate-900",
                    spec.mono && "font-mono"
                  )}
                >
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compatibility" className="mt-5 space-y-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              ماتریس سازگاری فنی با تیپ‌های خودرو
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تطابق بر اساس کد فنی، سال ساخت و مشخصات سیستم تعلیق خودرو بررسی شده است.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5 font-extrabold whitespace-nowrap">
                    خودرو و تیپ
                  </th>
                  <th className="px-3.5 py-2.5 font-extrabold whitespace-nowrap">
                    پیشرانه / موتور
                  </th>
                  <th className="px-3.5 py-2.5 font-extrabold whitespace-nowrap">
                    بازه سال ساخت
                  </th>
                  <th className="px-3.5 py-2.5 font-extrabold whitespace-nowrap">
                    موقعیت نصب
                  </th>
                  <th className="px-3.5 py-2.5 font-extrabold whitespace-nowrap">
                    وضعیت سازگاری
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {compatibilityMatrix.map((row) => {
                  const isUsersCar =
                    hydrated && selectedCar && selectedCar.id === row.carId;
                  return (
                    <tr
                      key={row.carId}
                      className={cn(
                        isUsersCar && row.isCompatible && "bg-emerald-50/70",
                        isUsersCar && !row.isCompatible && "bg-red-50/70"
                      )}
                    >
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                        {row.carName}
                        {isUsersCar && (
                          <span className="mr-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            خودروی شما
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                        {row.engine}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                        {row.years}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                        {row.position || "محور جلو"}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        {row.isCompatible ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            سازگار کامل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" />
                            ناسازگار (نصب نمی‌شود)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
