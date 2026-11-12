import * as React from "react";
import { cn } from "@/lib/utils";

function badgeVariants({ variant = "default", className = "" } = {}) {
  const base =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-slate-100 text-slate-800",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground border-slate-300",
    success: "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "border-transparent bg-amber-50 text-amber-700 border-amber-200",
    accent: "border-transparent bg-orange-50 text-orange-700 border-orange-200 font-bold",
    car: "border-transparent bg-slate-900 text-white font-medium",
  };

  return cn(base, variants[variant] || variants.default, className);
}

function Badge({ className, variant, ...props }) {
  return (
    <div className={badgeVariants({ variant, className })} {...props} />
  );
}

export { Badge, badgeVariants };
