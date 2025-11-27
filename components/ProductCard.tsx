"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: {
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
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : product.discount;

  const totalStock = product.variants.reduce(
    (acc, variant) =>
      acc + variant.sizes.reduce((sAcc, size) => sAcc + size.stock, 0),
    0
  );

  const isOutOfStock = totalStock === 0;

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-40 sm:h-80 w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={`object-cover transition-transform duration-300 ${
                isOutOfStock ? "opacity-60 grayscale" : "group-hover:scale-105"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-textSecondary text-xs">No Image</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="bg-black/70 text-white px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-0">
        <div className="flex flex-col">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-medium text-foreground hover:opacity-80 transition-opacity uppercase truncate">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-medium sm:text-lg font-semibold text-foreground">
              ₹ {product.price.toLocaleString("en-IN")}
            </p>
            {hasDiscount && product.originalPrice && (
              <>
                <p className="text-base text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </p>
                {discountPercent && (
                  <span className="bg-pink-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
