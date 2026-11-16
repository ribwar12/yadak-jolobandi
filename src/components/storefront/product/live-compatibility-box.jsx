"use client";

import Link from "next/link";
import { AlertTriangle, CarFront, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCarStore } from "@/store/use-car-store";
import { useUiStore } from "@/store/use-ui-store";

export function LiveCompatibilityBox({
  compatibleCarIds = [],
  compatibleCars = [],
  position = "",
}) {
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);
  const openCarSelector = useUiStore((s) => s.openCarSelector);

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-500">
        در حال بررسی سازگاری قطعه با خودروی شما...
      </div>
    );
  }

  if (!selectedCar) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <CarFront className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              خودروی خود را انتخاب کنید تا سازگاری بررسی شود
            </p>
            <p className="text-xs text-slate-600">
              این قطعه برای{" "}
              <span className="font-semibold text-slate-800">
                {compatibleCars.length > 0
                  ? `${compatibleCars.slice(0, 2).map((c) => c.name).join("، ")}${
                      compatibleCars.length > 2 ? " و ..." : ""
                    }`
                  : "خودروهای منتخب"}
              </span>{" "}
              طراحی شده است.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openCarSelector}
          className="h-8 text-xs font-bold border-accent text-accent hover:bg-orange-50 shrink-0 self-start sm:self-center"
        >
          انتخاب خودروی من
        </Button>
      </div>
    );
  }

  const isCompatible = compatibleCarIds.includes(selectedCar.id);

  if (isCompatible) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
              کاملاً سازگار با {selectedCar.name}
            </p>
            <p className="text-xs text-emerald-800">
              تطابق فنی تاییدشده{position ? ` • موقعیت نصب: ${position}` : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCarSelector}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline shrink-0 self-start sm:self-center"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تغییر خودرو
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/85 p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-extrabold text-red-900">
              هشدار عدم سازگاری با {selectedCar.name}
            </p>
            <p className="text-xs text-red-800 leading-relaxed">
              ابعاد یا نوع اتصال این قطعه با خودروی انتخاب‌شده در گاراژ شما هم‌خوانی ندارد. قبل از خرید، مدل سازگار خودرو را انتخاب کنید.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 bg-white border-red-300 text-red-800 hover:bg-red-100 text-xs font-bold"
        >
          <Link href={`/products?car=${selectedCar.id}`}>
            مشاهده قطعات سازگار با {selectedCar.name}
          </Link>
        </Button>

        <button
          type="button"
          onClick={openCarSelector}
          className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline px-2 py-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تغییر خودرو
        </button>
      </div>
    </div>
  );
}
