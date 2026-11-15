import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProductCardSkeleton({ horizontalOnMobile = false }) {
  return (
    <div
      className={cn(
        "flex justify-between rounded-xl border border-slate-200 bg-white shadow-sm",
        horizontalOnMobile
          ? "flex-row sm:flex-col gap-3 sm:gap-0 p-3 sm:p-3.5"
          : "flex-col p-3.5"
      )}
    >
      <Skeleton
        className={cn(
          "rounded-lg shrink-0",
          horizontalOnMobile
            ? "w-28 h-28 sm:w-full sm:h-auto sm:aspect-square mb-0 sm:mb-3"
            : "aspect-square w-full mb-3"
        )}
      />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Skeleton className="h-3.5 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1.5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div
          className={cn(
            "border-t border-slate-100 flex items-center justify-between",
            horizontalOnMobile ? "mt-2.5 pt-2 sm:mt-4 sm:pt-3" : "mt-4 pt-3"
          )}
        >
          <Skeleton className="h-8 w-20 sm:h-9 sm:w-28 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 sm:w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
