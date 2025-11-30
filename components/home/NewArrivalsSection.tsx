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
  orderCount?: number;
  createdAt?: string;
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 mb-8 sm:px-15">
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
            className="rounded-full border-1 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground px-4 py-6 text-md font-medium transition-all duration-300"
          >
            <Link href="/products">View All New Arrivals</Link>
          </Button>
        </div>
      )}
    </>
  );
}
