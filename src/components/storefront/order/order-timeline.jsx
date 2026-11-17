"use client";

import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import {
  ORDER_STATUS_META,
  ORDER_TIMELINE_STEPS,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderTimeline({ status = "pending_payment", paymentStatus = "pending" }) {
  const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending_payment;

  if (status === "cancelled" || paymentStatus === "failed") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 flex items-center gap-3">
        <XCircle className="h-6 w-6 text-red-600 shrink-0" />
        <div>
          <p className="text-sm font-extrabold text-red-900">
            سفارش لغو شده / پرداخت ناموفق
          </p>
          <p className="text-xs text-red-800 mt-0.5">
            تراکنش بانکی تکمیل نشد و موجودی اقلام به سبد خرید یا انبار بازگشت.
          </p>
        </div>
      </div>
    );
  }

  const activeStepIndex =
    paymentStatus === "paid" && meta.stepIndex < 1 ? 1 : meta.stepIndex;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-5">
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {ORDER_TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx <= activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <div
              key={step.key}
              className="relative flex flex-col items-center text-center gap-1.5 sm:gap-2 min-w-0"
            >
              {/* خط اتصال افقی */}
              {idx < ORDER_TIMELINE_STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute top-3.5 sm:top-4 left-0 w-[calc(50%-0.9rem)] sm:w-[calc(50%-1.25rem)] h-0.5",
                    idx < activeStepIndex ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute top-3.5 sm:top-4 right-0 w-[calc(50%-0.9rem)] sm:w-[calc(50%-1.25rem)] h-0.5",
                    idx <= activeStepIndex ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}

              <div
                className={cn(
                  "relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isCompleted
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-300 text-slate-400",
                  isCurrent && "ring-4 ring-emerald-100"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : isCurrent ? (
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                ) : (
                  <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] sm:text-xs font-bold leading-tight",
                  isCompleted ? "text-slate-900" : "text-slate-400"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
