"use client";

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

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 border-t">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-foreground uppercase tracking-tight">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
