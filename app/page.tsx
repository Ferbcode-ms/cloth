import { Suspense } from "react";
import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Slider from "@/lib/models/Slider";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import CategoryCardSkeleton from "@/components/products/CategoryCardSkeleton";
import HeroSection from "@/components/home/HeroSection";
import BrandBanner from "@/components/home/BrandBanner";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import CategoryProductsSection from "@/components/home/CategoryProductsSection";
import { calculateProductPrice } from "@/lib/utils/price";


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

    // Fetch categories for discount calculation
    const categories = await Category.find({}).select("name discount discountType").lean();
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const productsWithDiscounts = products.map((product: any) => {
      return calculateProductPrice(product, categoryMap);
    });

    return JSON.parse(JSON.stringify(productsWithDiscounts));
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


async function getSliders() {
  try {
    await connectDB();
    const sliders = await Slider.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return JSON.parse(JSON.stringify(sliders));
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return [];
  }
}

async function getCategoryProducts(categoryName: string, limit: number = 6) {
  try {
    await connectDB();
    const products = await Product.find({ category: categoryName })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Fetch categories for discount calculation
    const categories = await Category.find({}).select("name discount discountType").lean();
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const productsWithDiscounts = products.map((product: any) => {
      return calculateProductPrice(product, categoryMap);
    });

    return JSON.parse(JSON.stringify(productsWithDiscounts));
  } catch (error) {
    console.error(`Error fetching ${categoryName} products:`, error);
    return [];
  }
}

export default async function Home() {
  await connectDB();
  
  // First, fetch categories to get their names
  const allCategories = await Category.find()
    .sort({ name: 1 })
    .limit(3)
    .lean();
  const categoryNames = allCategories.map((cat: any) => cat.name);

  const newArrivalsData = getNewArrivals();
  const categoriesData = getCategories();
  const slidersData = getSliders();
  const category1Data = categoryNames[0] ? getCategoryProducts(categoryNames[0], 4) : Promise.resolve([]);
  const category2Data = categoryNames[1] ? getCategoryProducts(categoryNames[1], 4) : Promise.resolve([]);
  const category3Data = categoryNames[2] ? getCategoryProducts(categoryNames[2], 4) : Promise.resolve([]);

  // Parallel data fetching
  const [newArrivals, categories, sliders, category1Products, category2Products, category3Products] = await Promise.all([
    newArrivalsData,
    categoriesData,
    slidersData,
    category1Data,
    category2Data,
    category3Data,
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
      <HeroSection sliders={sliders} />

      {/* Brand Banner */}
      <BrandBanner />

      {/* Browse by Category */}
      <section className="container mx-auto px-2 md:px-6 lg:px-8 py-10 lg:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className=" rounded-4xl p-4 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 md:mb-12 text-center text-textPrimary uppercase">
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
          <h2 className="text-2xl sm:text-3xl sm:pl-15 md:text-5xl font-semibold mb-8 md:mb-12  text-textPrimary">
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

      {/* Category 1 Products */}
      {categoryNames[0] && category1Products.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
          <h2 className="text-2xl sm:text-3xl sm:pl-15 md:text-5xl font-semibold mb-8 md:mb-12 text-textPrimary">
            {categoryNames[0].toUpperCase()}
          </h2>
          <CategoryProductsSection 
            categoryName={categoryNames[0]} 
            products={category1Products} 
          />
        </section>
      )}

      {/* Category 2 Products */}
      {categoryNames[1] && category2Products.length > 0 && (
        <section className="w-full bg-muted/60 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-800">
            <h2 className="text-2xl sm:text-3xl sm:pl-15 md:text-5xl font-semibold mb-8 md:mb-12 text-textPrimary">
              {categoryNames[1].toUpperCase()}
            </h2>
            <CategoryProductsSection 
              categoryName={categoryNames[1]} 
              products={category2Products} 
            />
          </div>
        </section>
      )}

      {/* Category 3 Products */}
      {categoryNames[2] && category3Products.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-900">
          <h2 className="text-2xl sm:text-3xl sm:pl-15 md:text-5xl font-semibold mb-8 md:mb-12 text-textPrimary">
            {categoryNames[2].toUpperCase()}
          </h2>
          <CategoryProductsSection 
            categoryName={categoryNames[2]} 
            products={category3Products} 
          />
        </section>
      )}

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
}
