import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <div className="relative h-80 w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </Card>
  );
}
