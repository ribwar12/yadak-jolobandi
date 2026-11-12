import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div>
        <Skeleton className="aspect-square w-full rounded-lg mb-3" />
        <Skeleton className="h-3.5 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}
