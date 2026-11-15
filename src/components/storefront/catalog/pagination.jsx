"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";

export function CatalogPagination({
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <nav
      aria-label="صفحه‌بندی محصولات"
      className="mt-8 flex items-center justify-center gap-1.5"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="صفحه قبلی"
        className="h-9 w-9 rounded-lg border-slate-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "h-9 min-w-9 rounded-lg px-2.5 text-xs font-bold transition-colors tabular-nums border",
            p === page
              ? "bg-accent border-accent text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-700 hover:border-accent hover:text-accent"
          )}
        >
          {formatNumber(p)}
        </button>
      ))}

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="صفحه بعدی"
        className="h-9 w-9 rounded-lg border-slate-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </nav>
  );
}
