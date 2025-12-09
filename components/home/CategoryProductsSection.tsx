"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";

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

interface CategoryProductsSectionProps {
  categoryName: string;
  products: Product[];
}

export default function CategoryProductsSection({ 
  categoryName, 
  products 
}: CategoryProductsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-10 sm:px-15">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center text-muted-foreground text-sm mb-8">
          No products available in this category yet.
        </p>
      )}
      {products.length > 0 && (
        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            className="rounded-none border-1 border-primary/40 bg-background text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 shadow-none text-md font-medium transition-all duration-300"
          >
            <Link href={`/products?category=${encodeURIComponent(categoryName)}`}>
              View All {categoryName}
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
