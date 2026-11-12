"use client";

import { CarFront, CheckCircle2, ChevronDown, X } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useCarStore } from "@/store/use-car-store";
import { useUiStore } from "@/store/use-ui-store";

export function CarSelectorPill({ className }) {
  const hydrated = useHydrated();
  const selectedCar = useCarStore((s) => s.selectedCar);
  const clearSelectedCar = useCarStore((s) => s.clearSelectedCar);
  const openCarSelector = useUiStore((s) => s.openCarSelector);

  if (hydrated && selectedCar) {
    return (
      <div
        className={cn(
          "inline-flex h-10 items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50/90 px-2.5 text-xs transition-colors",
          className
        )}
      >
        <button
          type="button"
          onClick={openCarSelector}
          className="inline-flex items-center gap-1.5 min-w-0 text-right"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-900 truncate max-w-[165px]">
            {selectedCar.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearSelectedCar();
          }}
          aria-label="حذف فیلتر خودرو"
          title="حذف فیلتر خودرو"
          className="rounded p-1 text-slate-500 hover:bg-emerald-200/60 hover:text-red-600 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openCarSelector}
      className={cn(
        "inline-flex h-10 items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:border-accent hover:bg-orange-50/50 hover:text-accent transition-colors whitespace-nowrap",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CarFront className="h-4 w-4 text-accent shrink-0" />
        <span>انتخاب خودروی من</span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
    </button>
  );
}
