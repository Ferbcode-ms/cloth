import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CategoryCardSkeleton() {
  return (
    <Card className="relative w-full h-full min-h-[250px] md:min-h-[300px] overflow-hidden rounded-xl border-0 bg-white shadow-md">
      <Skeleton className="w-full h-full" />
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <Skeleton className="h-6 w-32 md:h-8 md:w-40" />
      </div>
    </Card>
  );
}
