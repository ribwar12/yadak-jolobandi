"use client";

import { useState } from "react";
import { ArrowRight, CarFront, Check, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCars } from "@/hooks/queries/use-catalog";
import { cn, formatNumber } from "@/lib/utils";
import { useCarStore } from "@/store/use-car-store";
import { useUiStore } from "@/store/use-ui-store";

export function CarSelectorModal() {
  const isOpen = useUiStore((s) => s.isCarSelectorOpen);
  const setCarSelectorOpen = useUiStore((s) => s.setCarSelectorOpen);

  const selectedCar = useCarStore((s) => s.selectedCar);
  const setSelectedCar = useCarStore((s) => s.setSelectedCar);
  const clearSelectedCar = useCarStore((s) => s.clearSelectedCar);

  const { data: carsData, isLoading } = useCars();

  const [selectedManufacturer, setSelectedManufacturer] = useState("all");
  const [activeFamilyId, setActiveFamilyId] = useState(null);

  const manufacturers = carsData?.manufacturers || [];
  const families = (carsData?.families || []).filter((fam) =>
    selectedManufacturer === "all"
      ? true
      : fam.manufacturerId === selectedManufacturer
  );

  const activeFamily =
    (carsData?.families || []).find((f) => f.id === activeFamilyId) || null;

  const handleSelectModel = (model, family) => {
    setSelectedCar({
      ...model,
      familyId: family.id,
      familyName: family.name,
      manufacturerId: family.manufacturerId,
    });
    toast.success(`خودروی شما روی «${model.name}» تنظیم شد`, {
      description: "اکنون قطعات سازگار با این خودرو برای شما علامت‌گذاری می‌شوند.",
    });
    setActiveFamilyId(null);
    setCarSelectorOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setCarSelectorOpen(open);
        if (!open) setActiveFamilyId(null);
      }}
    >
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-accent mb-1">
            <CarFront className="h-5 w-5" />
            <span className="text-xs font-bold">سیستم هوشمند تطابق شاسی و جلوبندی</span>
          </div>
          <DialogTitle className="text-xl font-black">
            {activeFamily
              ? `انتخاب تیپ دقیق ${activeFamily.name}`
              : "انتخاب مدل خودروی شما («ماشین من»)"}
          </DialogTitle>
          <DialogDescription>
            با انتخاب خودروی خود، تنها قطعات ۱۰۰٪ سازگار با جلوبندی و اکسل خودروی شما هایلایت و فیلتر می‌شوند.
          </DialogDescription>
        </DialogHeader>

        {selectedCar && !activeFamily && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>
                خودروی فعلی: <strong className="text-slate-900">{selectedCar.name}</strong>
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSelectedCar();
                toast.info("فیلتر خودروی من حذف شد");
              }}
              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف خودرو
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            در حال دریافت کاتالوگ خودروها...
          </div>
        ) : activeFamily ? (
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveFamilyId(null)}
              className="gap-1.5 text-slate-600 px-2"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست خانواده خودروها
            </Button>

            <div className="grid grid-cols-1 gap-2.5">
              {activeFamily.models.map((model) => {
                const isCurrent = selectedCar?.id === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model, activeFamily)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3.5 text-right transition-all hover:border-accent hover:bg-orange-50/40",
                      isCurrent
                        ? "border-accent bg-orange-50/60 ring-1 ring-accent"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {model.name}
                        </span>
                        {isCurrent && (
                          <Badge variant="success" className="text-[10px]">
                            انتخاب فعلی
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {model.engine} • سال‌های {model.years}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">
                        {formatNumber(model.productCount || 0)} قطعه
                      </Badge>
                      {isCurrent && <Check className="h-4 w-4 text-accent" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* گام ۱: فیلتر خودروساز */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedManufacturer("all")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  selectedManufacturer === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                همه خودروسازان
              </button>
              {manufacturers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedManufacturer(m.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    selectedManufacturer === m.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* گام ۲: انتخاب خانواده خودرو */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {families.map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => setActiveFamilyId(fam.id)}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-right transition-all hover:border-accent hover:shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-orange-50 group-hover:text-accent transition-colors">
                      <CarFront className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      {formatNumber(fam.productCount || 0)} قطعه سازگار
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-accent transition-colors">
                      {fam.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{fam.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
