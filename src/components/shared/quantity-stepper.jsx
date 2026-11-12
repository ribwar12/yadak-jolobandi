"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";

export function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  onRemove,
  size = "default",
  disabled = false,
  className,
}) {
  const isCompact = size === "sm";

  const handleDecrement = () => {
    if (value <= min && onRemove) {
      onRemove();
      return;
    }
    if (value > min) {
      onChange?.(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange?.(value + 1);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-slate-300 bg-white tabular-nums",
        isCompact ? "h-8 px-1" : "h-10 px-1.5",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        aria-label="افزایش تعداد"
        className={cn(
          "rounded-md text-slate-700 hover:bg-slate-100",
          isCompact ? "h-6 w-6" : "h-7 w-7"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>

      <span
        className={cn(
          "min-w-[2rem] text-center font-bold text-slate-900 select-none",
          isCompact ? "text-xs" : "text-sm"
        )}
      >
        {formatNumber(value)}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || (value <= min && !onRemove)}
        onClick={handleDecrement}
        aria-label={value <= min && onRemove ? "حذف از سبد" : "کاهش تعداد"}
        className={cn(
          "rounded-md text-slate-700 hover:bg-slate-100",
          value <= min && onRemove && "text-red-600 hover:bg-red-50 hover:text-red-700",
          isCompact ? "h-6 w-6" : "h-7 w-7"
        )}
      >
        {value <= min && onRemove ? (
          <Trash2 className="h-3.5 w-3.5" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
