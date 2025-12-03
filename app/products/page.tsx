import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import ProductsFilters from "@/components/products/ProductsFilters";
import ProductsClient from "@/components/products/ProductsClient";
import ProductsFiltersSkeleton from "@/components/products/ProductsFiltersSkeleton";
import ProductsGridSkeleton from "@/components/products/ProductsGridSkeleton";
import ProductsSearchBar from "@/components/products/ProductsSearchBar";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Color from "@/lib/models/Color";
import Size from "@/lib/models/Size";
import type { SortOrder } from "mongoose";

export const revalidate = 3600; // Revalidate every hour

type ProductsPageSearchParams = {
  page?: string | string[];
  category?: string | string[];
  subcategory?: string | string[];
  colors?: string | string[];
  sizes?: string | string[];
  sort?: string | string[];
  search?: string | string[];
};

import { Metadata } from "next";

interface ProductsPageProps {
  searchParams: Promise<ProductsPageSearchParams>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const search = Array.isArray(params.search)
    ? params.search[0]
    : params.search;

  let title = "Shop All Products | Clothing Store";
  let description =
    "Browse our extensive collection of high-quality clothing. Find the perfect style for you.";

  if (search) {
    title = `Search results for "${search}" | Clothing Store`;
    description = `Search results for "${search}" in our clothing store.`;
  } else if (category) {
    title = `${category} Clothing | Clothing Store`;
    description = `Shop the latest ${category} fashion trends. High-quality ${category} clothing for every occasion.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    robots: {
      index: !search, // Don't index search results
      follow: true,
    },
  };
}

const buildSortQuery = (
  sort: string,
  useTextSearch: boolean
): Record<string, SortOrder | { $meta: string }> => {
  if (useTextSearch && sort === "most-popular") {
    return { score: { $meta: "textScore" }, createdAt: -1 };
  }

  if (sort === "price-low") {
    return { price: 1 };
  }

  if (sort === "price-high") {
    return { price: -1 };
  }

  if (sort === "newest") {
    return { createdAt: -1 };
  }

  return { createdAt: -1 };
};

const isTextIndexError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: number; message?: string };
  return (
    err.code === 27 ||
    err.message?.toLowerCase().includes("text index required")
  );
};

async function getProducts(
  page: number = 1,
  filters: {
    category?: string;
    subcategory?: string;
    colors?: string[];
    sizes?: string[];
    sort?: string;
    search?: string;
  } = {}
) {
  try {
    const limit = 16; // Changed to 9 to match 3x3 grid
    const skip = (page - 1) * limit;

    const query: any = {};
    const projection: Record<string, any> = {
      title: 1,
      description: 1,
      price: 1,
      images: 1,
      slug: 1,
      category: 1,
      subcategory: 1,
      variants: 1,
      createdAt: 1,
      orderCount: 1,
      discount: 1,
      discountType: 1,
    };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    if (filters.colors && filters.colors.length > 0) {
      query["variants.color"] = { $in: filters.colors };
    }

    if (filters.sizes && filters.sizes.length > 0) {
      query["variants.sizes.size"] = { $in: filters.sizes };
    }

    const searchTerm = filters.search?.trim();
    let useTextSearch = Boolean(searchTerm && searchTerm.length >= 2);
    const regexConditions =
      searchTerm && searchTerm.length > 0
        ? [
            { title: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
          ]
        : null;

    if (useTextSearch) {
      query.$text = { $search: searchTerm };
      projection.score = { $meta: "textScore" };
    } else if (regexConditions) {
      query.$or = regexConditions;
    }

    const selectedSort = filters.sort || "most-popular";

    const runQuery = () =>
      Promise.all([
        Product.find(query)
          .sort(buildSortQuery(selectedSort, useTextSearch))
          .skip(skip)
          .limit(limit)
          .select(projection)
          .lean(),
        Product.countDocuments(query),
      ]);

    let result: { products: any[]; total: number };

    try {
      const [products, total] = await runQuery();
      result = { products, total };
    } catch (error) {
      if (useTextSearch && isTextIndexError(error)) {
        console.warn(
          "Full-text search index missing, falling back to regex search."
        );
        useTextSearch = false;
        delete query.$text;
        delete projection.score;
        if (regexConditions) {
          query.$or = regexConditions;
        }
        const [fallbackProducts, fallbackTotal] = await Promise.all([
          Product.find(query)
            .sort(buildSortQuery(selectedSort, useTextSearch))
            .skip(skip)
            .limit(limit)
            .select(projection)
            .lean(),
          Product.countDocuments(query),
        ]);
        result = {
          products: fallbackProducts,
          total: fallbackTotal,
        };
      } else {
        throw error;
      }
    }

    // Fetch categories for discount calculation
    const categories = await Category.find({}).select("name discount discountType").lean();
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const sanitizedProducts = result.products.map((product: any) => {
      // Calculate Discount
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

      if ("score" in product) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { score, ...rest } = product;
        return rest;
      }
      return product;
    });

    return {
      products: JSON.parse(JSON.stringify(sanitizedProducts)),
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: {
        page,
        limit: 9,
        total: 0,
        pages: 0,
      },
    };
  }
}

async function getFiltersData() {
  const [categories, colors, sizes] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Color.find().sort({ name: 1 }).lean(),
    Size.find().sort({ order: 1, name: 1 }).lean(),
  ]);

  return {
    categories: JSON.parse(JSON.stringify(categories)),
    colors: JSON.parse(JSON.stringify(colors)),
    sizes: JSON.parse(JSON.stringify(sizes)),
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  await connectDB();

  const params = (await searchParams) ?? {};

  const getParamValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const pageParam = parseInt(getParamValue(params.page) || "1");
  const page = pageParam > 0 ? pageParam : 1;
  const category = getParamValue(params.category);
  const subcategory = getParamValue(params.subcategory);
  const colors = getParamValue(params.colors)?.split(",").filter(Boolean);
  const sizes = getParamValue(params.sizes)?.split(",").filter(Boolean);
  const sort = getParamValue(params.sort) || "most-popular";
  const search = getParamValue(params.search)?.trim() || "";

  const [{ products, pagination }, filtersData] = await Promise.all([
    getProducts(page, {
      category,
      subcategory,
      colors,
      sizes,
      sort,
      search,
    }),
    getFiltersData(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-4 sm:py-12 lg:py-16">
      {/* Breadcrumbs */}
      <div className="flex justify-between sm:items-center sm:flex-row flex-col">

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 sm:mb-8 uppercase">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Shop</span>
      </div>

      {/* Search Bar */}
      <ProductsSearchBar initialValue={search} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 uppercase">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <Suspense fallback={<ProductsFiltersSkeleton />}>
            <ProductsFilters
              categories={filtersData.categories}
              colors={filtersData.colors}
              sizes={filtersData.sizes}
            />
          </Suspense>
        </aside>

        {/* Products Content */}
        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
              <Link
                href="/products"
                className="text-sm text-foreground hover:underline mt-4 inline-block uppercase"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsClient products={products} pagination={pagination} />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
