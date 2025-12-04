"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";

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
    orderCount?: number;
    createdAt?: string;
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

  // Badge logic
  const isNew = product.createdAt
    ? new Date().getTime() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;
  const isBestSeller = (product.orderCount || 0) >= 10;

  return (
    <Card className="overflow-hidden rounded-none shadow-none bg-transparent group border-0">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-50 sm:h-90 w-full bg-gray-200 overflow-hidden mb-4">
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

          {/* Badges */}
          {!isOutOfStock && (isBestSeller || isNew) && (
            <div className="absolute sm:top-2 top-1 sm:left-2 left-1 flex flex-col sm:gap-2 gap-1">
              {isBestSeller && (
                <Badge className="text-primary hover:bg-background bg-background rounded-none border-0 shadow-lg px-1 sm:px-2 sm:py-1 py-0.5 text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">Best Seller</span>
                  <span className="sm:hidden">Best</span>
                </Badge>
              )}
              {isNew && (
                <Badge className="text-primary hover:bg-background bg-background rounded-none border-0 shadow-lg px-1 sm:px-2 sm:py-1 py-0.5 text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
                
                  New
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-0">
        <div className="flex flex-col">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-textPrimary hover:opacity-80 transition-opacity uppercase truncate">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-medium sm:text-lg font-medium text-textPrimary">
              ₹ {product.price.toLocaleString("en-IN")}
            </p>
            {hasDiscount && product.originalPrice && (
              <>
                <p className="text-base  text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </p>
                {discountPercent && (
                  <span className="text-primary border-2 border-primary/40 rounded-none text-xs font-medium px-2 py-0.5 ">
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
