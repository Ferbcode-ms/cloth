import { Suspense } from "react";
import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import CategoryCardSkeleton from "@/components/products/CategoryCardSkeleton";
import HeroSection from "@/components/home/HeroSection";
import BrandBanner from "@/components/home/BrandBanner";
import TestimonialsSection from "@/components/home/TestimonialsSection";
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

    // Fetch categories for discount calculation
    const categories = await Category.find({}).select("name discount discountType").lean();
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const productsWithDiscounts = products.map((product: any) => {
      let finalPrice = product.price;
      let discountAmount = 0;
      let hasDiscount = false;
      let appliedDiscount = 0;
      let appliedDiscountType = "percentage";

      // 1. Check Product Discount
      if (product.discount > 0) {
        hasDiscount = true;
        appliedDiscount = product.discount;
        appliedDiscountType = product.discountType || "percentage";
        
        if (appliedDiscountType === "fixed") {
          discountAmount = appliedDiscount;
        } else {
          discountAmount = (product.price * appliedDiscount) / 100;
        }
      } 
      // 2. Check Category Discount (only if no product discount)
      else if (product.category && categoryMap.has(product.category)) {
        const cat = categoryMap.get(product.category);
        if (cat && cat.discount > 0) {
          hasDiscount = true;
          appliedDiscount = cat.discount;
          appliedDiscountType = cat.discountType || "percentage";
          
          // Attach discount info
          product.discount = appliedDiscount;
          product.discountType = appliedDiscountType;

          if (appliedDiscountType === "fixed") {
            discountAmount = appliedDiscount;
          } else {
            discountAmount = (product.price * appliedDiscount) / 100;
          }
        }
      }

      if (hasDiscount) {
        finalPrice = Math.max(0, product.price - discountAmount);
        product.originalPrice = product.price;
        product.price = finalPrice;
      }
      
      return product;
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
          <h2 className="text-2xl sm:text-3xl sm:pl-15 md:text-5xl font-bold mb-8 md:mb-12  text-textPrimary">
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
