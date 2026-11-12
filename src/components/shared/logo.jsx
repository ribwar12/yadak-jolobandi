import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "light", compact = false }) {
  const isDark = variant === "dark";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 sm:gap-2.5 group select-none", className)}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm transition-transform group-hover:scale-105",
          compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10"
        )}
      >
        <Wrench className={cn(compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5")} />
      </div>
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-black tracking-tight",
              compact ? "text-base sm:text-lg" : "text-lg",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            یدک‌جلوبندی
          </span>
          <span
            className={cn(
              "text-[11px] font-bold text-accent bg-orange-500/10 px-1.5 py-0.5 rounded",
              compact ? "hidden xl:inline-block" : "hidden sm:inline-block"
            )}
          >
            YadakSuspension
          </span>
        </div>
        <span
          className={cn(
            "text-[11px] font-medium",
            compact ? "hidden sm:block" : "block",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          مرجع تخصصی تعلیق و جلوبندی
        </span>
      </div>
    </Link>
  );
}
