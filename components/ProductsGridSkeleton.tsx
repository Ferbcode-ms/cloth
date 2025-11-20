import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductsGridSkeletonProps {
  count?: number;
}

export default function ProductsGridSkeleton({
  count = 9,
}: ProductsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
