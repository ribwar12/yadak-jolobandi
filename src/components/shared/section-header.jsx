import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  badge,
  actionLabel,
  actionHref,
  variant = "light",
  className,
  children,
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6",
        className
      )}
    >
      <div className="space-y-1.5">
        {badge && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border",
              isDark
                ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                : "bg-orange-50 text-accent border-orange-200"
            )}
          >
            {badge}
          </div>
        )}
        <h2
          className={cn(
            "text-xl sm:text-2xl font-black tracking-tight",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("text-xs sm:text-sm", isDark ? "text-slate-300" : "text-slate-500")}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-bold transition-colors shrink-0",
              isDark ? "text-orange-400 hover:text-orange-300" : "text-accent hover:text-brand-700"
            )}
          >
            <span>{actionLabel}</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
