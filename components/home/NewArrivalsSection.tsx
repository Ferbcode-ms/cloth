"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  slug: string;
  category?: string;
  rating?: number;
  variants: Array<{
    color: string;
    sizes: Array<{ size: string; stock: number }>;
  }>;
}

interface NewArrivalsSectionProps {
  newArrivals: Product[];
}

export default function NewArrivalsSection({ newArrivals }: NewArrivalsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8">
        {newArrivals.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {newArrivals.length === 0 && (
        <p className="text-center text-muted-foreground text-sm mb-8">
          No products available yet.
        </p>
      )}
      {newArrivals.length > 0 && (
        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg font-medium transition-all duration-300"
          >
            <Link href="/products">View All New Arrivals</Link>
          </Button>
        </div>
      )}
    </>
  );
}
