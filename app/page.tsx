import { Suspense } from "react";
import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import CategoryCardSkeleton from "@/components/CategoryCardSkeleton";
import HeroSection from "@/components/HeroSection";
import BrandBanner from "@/components/BrandBanner";
import TestimonialsSection from "@/components/TestimonialsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Clothing Store | Find Your Style",
  description:
    "Discover the latest trends in fashion. Shop high-quality clothing from top international brands.",
  openGraph: {
    title: "Clothing Store | Find Your Style",
    description:
      "Discover the latest trends in fashion. Shop high-quality clothing from top international brands.",
    type: "website",
  },
};

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
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home() {
  const newArrivalsData = getNewArrivals();
  const categoriesData = getCategories();

  // Parallel data fetching
  const [newArrivals, categories] = await Promise.all([
    newArrivalsData,
    categoriesData,
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Clothing Store",
    url: "https://clothing-store.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://clothing-store.com/products?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Brand Banner */}
      <BrandBanner />

      {/* Browse by Category */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
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
