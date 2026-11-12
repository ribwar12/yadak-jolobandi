"use client";

import { AlertTriangle, PhoneCall } from "lucide-react";
import { useSiteSettings } from "@/hooks/queries/use-settings";

export function MarketVolatilityAlert() {
  const { data: settings } = useSiteSettings();

  if (!settings?.priceUpdateMode) return null;

  return (
    <div className="bg-amber-600 text-white border-b border-amber-700">
      <div className="container mx-auto py-2.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {settings.priceUpdateMessage ||
              "به علت نوسانات شدید بازار لوازم یدکی، قیمت‌ها در حال به‌روزرسانی لحظه‌ای است."}
          </span>
        </div>
        <a
          href={`tel:${settings.supportPhoneRaw || "02133990011"}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs font-black text-amber-900 shadow-sm hover:bg-amber-50 shrink-0"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>استعلام فوری: {settings.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}</span>
        </a>
      </div>
    </div>
  );
}
