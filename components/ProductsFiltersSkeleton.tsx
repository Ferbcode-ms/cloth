import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductsFiltersSkeleton() {
  return (
    <div className="w-full lg:w-80 space-y-8">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Categories Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>
      </div>

      <Separator />

      {/* Colors Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      </div>

      <Separator />

      {/* Sizes Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-16" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
