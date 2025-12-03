import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 py-8 lg:py-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <Card className="relative h-[400px] w-full overflow-hidden rounded-lg border-0 shadow-lg">
            <Skeleton className="w-full h-full" />
          </Card>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-32" />
          </div>

          <Separator />

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>

          <Separator />

          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-20 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-16 rounded-full" />
              ))}
            </div>
          </div>

          <Separator />

          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
