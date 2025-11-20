import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import CategoryCardSkeleton from "@/components/CategoryCardSkeleton";
import HeroSection from "@/components/HeroSection";
import BrandBanner from "@/components/BrandBanner";
import TestimonialsSection from "@/components/TestimonialsSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const revalidate = 3600; // Revalidate every hour

async function getNewArrivals() {
  try {
    await connectDB();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find()
      .sort({ name: 1 })
      .limit(4) // Limit to 4 for the grid layout
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fallback image when category doesn't have an image
const getCategoryImage = (category: any) => {
  if (category.image) {
    return category.image;
  }
  // Default placeholder image - you can change this to any default image URL
  return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&q=80";
};

function CategoriesSection({ categories }: { categories: any[] }) {
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
      {categories.map((category: any, index: number) => (
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
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <h3 className="text-xl md:text-2xl font-bold text-textPrimary drop-shadow-lg">
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

function NewArrivalsSection({ newArrivals }: { newArrivals: any[] }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8">
        {newArrivals.map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {newArrivals.length === 0 && (
        <p className="text-center text-textSecondary text-sm mb-8">
          No products available yet.
        </p>
      )}
      {newArrivals.length > 0 && (
        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            className="rounded-full border border-textPrimary bg-white text-textPrimary hover:bg-black hover:text-white  px-15 py-8"
          >
            <Link href="/products">View All</Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default async function Home() {
  const newArrivals = await getNewArrivals();
  const categories = await getCategories();

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Brand Banner */}
      <BrandBanner />

      {/* Browse by Category */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-20 xl:px-32 py-12 lg:py-16">
        <div className="bg-muted rounded-4xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-6 md:mb-12 text-center text-textPrimary uppercase">
            BROWSE BY CATEGORY
          </h2>
          <Suspense
            fallback={
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto"
                style={{ gridTemplateRows: "repeat(2, 1fr)" }}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <CategoryCardSkeleton key={index} />
                ))}
              </div>
            }
          >
            <CategoriesSection categories={categories} />
          </Suspense>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="w-full bg-muted/60 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 xl:px-32 py-12 lg:py-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-8 md:mb-12 text-center text-textPrimary">
            NEW ARRIVALS
          </h2>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            }
          >
            <NewArrivalsSection newArrivals={newArrivals} />
          </Suspense>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
}
