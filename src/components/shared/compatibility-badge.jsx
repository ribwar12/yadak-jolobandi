"use client";

import { AlertTriangle, CheckCircle2, CarFront } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useCarStore } from "@/store/use-car-store";

export function CompatibilityBadge({
  compatibleCarIds = [],
  compatibleCars = [],
  className,
  showFallback = true,
}) {
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);

  const carIds =
    compatibleCarIds.length > 0
      ? compatibleCarIds
      : compatibleCars.map((c) => c.id);

  if (hydrated && selectedCar) {
    const isMatched = carIds.includes(selectedCar.id);
    if (isMatched) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200",
            className
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate">سازگار با {selectedCar.name}</span>
        </span>
      );
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 border border-red-200",
          className
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600" />
        <span className="truncate">ناسازگار با {selectedCar.name}</span>
      </span>
    );
  }

  if (!showFallback) return null;

  const firstCarName =
    compatibleCars?.[0]?.name || "خودروهای منتخب";
  const extraCount = Math.max(0, (compatibleCars?.length || carIds.length) - 1);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200",
        className
      )}
    >
      <CarFront className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      <span className="truncate">
        مناسب {firstCarName}
        {extraCount > 0 ? ` و ${extraCount} مدل دیگر` : ""}
      </span>
    </span>
  );
}
