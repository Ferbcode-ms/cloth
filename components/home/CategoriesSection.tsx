"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

// Fallback image when category doesn't have an image
const getCategoryImage = (category: Category) => {
  if (category.image) {
    return category.image;
  }
  // Default placeholder image
  return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&q=80";
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category) => (
        <Link
          key={category._id || category.slug}
          href={`/products?category=${encodeURIComponent(category.name)}`}
          className="h-full"
        >
          <Card className="relative w-full h-full min-h-[250px] md:min-h-[500px] overflow-hidden rounded-none border-0 bg-transparent shadow-none hover:shadow-none transition-all duration-300 group">
            <div className="relative w-full h-full">
              <Image
                src={getCategoryImage(category)}
                alt={category.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Darker gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 transition-all duration-500" />
              
              {/* Centered text overlay - "JAPANESE EDITION" style */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center px-4">
                  {/* THE */}
                  <p className="text-xs sm:text-sm md:text-base text-white/80 mb-2 tracking-[0.3em] uppercase font-light">
                    THE
                  </p>
                  
                  {/* CATEGORY NAME - Large and Bold */}
                  <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tighter  leading-none mb-2">
                    {category.name}
                  </h3>
                  
                  {/* EDITION */}
                  <p className="text-xs sm:text-sm md:text-base text-white/80 tracking-[0.3em] uppercase font-light">
                    COLLECTION
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
