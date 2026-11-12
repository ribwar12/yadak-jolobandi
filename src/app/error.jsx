"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200 mb-5">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
        بروز خطای غیرمنتظره در بارگذاری صفحه
      </h2>
      <p className="max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
        {error?.message ||
          "مشکلی در پردازش اطلاعات رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید."}
      </p>
      <Button
        variant="accent"
        onClick={() => reset?.()}
        className="gap-2 font-bold"
      >
        <RotateCcw className="h-4 w-4" />
        تلاش مجدد
      </Button>
    </div>
  );
}
