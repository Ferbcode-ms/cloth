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
  const getGridClasses = (index: number, total: number) => {
    if (total === 1) {
      return "md:col-start-1 md:col-end-4 md:row-start-1 md:row-end-3";
    }
    if (total === 2) {
      return index === 0
        ? "md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3"
        : "md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-3";
    }
    if (total === 3) {
      const classes = [
        "md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-2",
        "md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-2",
        "md:col-start-1 md:col-end-4 md:row-start-2 md:row-end-3",
      ];
      return classes[index];
    }
    const gridAreas = [
      "md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-2",
      "md:col-start-2 md:col-end-4 md:row-start-1 md:row-end-2",
      "md:col-start-1 md:col-end-3 md:row-start-2 md:row-end-3",
      "md:col-start-3 md:col-end-4 md:row-start-2 md:row-end-3",
    ];
    return gridAreas[index] || "";
  };

  if (categories.length === 0) return null;

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto"
      style={{ gridTemplateRows: "repeat(2, 1fr)" }}
    >
      {categories.map((category, index) => (
        <Link
          key={category._id || category.slug}
          href={`/products?category=${category.name}`}
          className={`${getGridClasses(index, categories.length)} h-full`}
        >
          <Card className="relative w-full h-full min-h-[250px] md:min-h-[300px] overflow-hidden rounded-xl border-0 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative w-full h-full">
              <Image
                src={getCategoryImage(category)}
                alt={category.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg uppercase tracking-wider">
                  {category.name}
                </h3>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
