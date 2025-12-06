"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/components/products/details/ProductGallery";
import ProductInfo from "@/components/products/details/ProductInfo";

interface ProductDetailClientProps {
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    variants: Array<{
      color: string;
      sizes: Array<{ size: string; stock: number }>;
    }>;
  };
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-0 max-w-7xl overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/60 py-6 lg:py-8">
        <Link href="/" className="hover:text-foreground transition-colors uppercase ">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-foreground transition-colors uppercase">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground uppercase truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 pb-12 lg:pb-20">
        {/* Image Gallery */}
        <div className="min-w-0">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Product Info */}
        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}
