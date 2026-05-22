import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import ProductsFilters from "@/components/products/ProductsFilters";
import ProductsClient from "@/components/products/ProductsClient";
import ProductsFiltersSkeleton from "@/components/products/ProductsFiltersSkeleton";
import ProductsGridSkeleton from "@/components/products/ProductsGridSkeleton";
import ProductsSearchBar from "@/components/products/ProductsSearchBar";
import { supabase } from "@/lib/supabase";
import { calculateProductPrice } from "@/lib/utils/price";
import { Metadata } from "next";

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

function mapProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    _id: p.id,
    discountType: p.discount_type,
    orderCount: p.order_count,
    totalStock: p.total_stock,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function mapCategory(c: any) {
  if (!c) return c;
  return {
    ...c,
    _id: c.id,
    discountType: c.discount_type,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function mapColor(c: any) {
  if (!c) return c;
  return {
    ...c,
    _id: c.id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function mapSize(s: any) {
  if (!s) return s;
  return {
    ...s,
    _id: s.id,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

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
    const limit = 16;
    const skip = (page - 1) * limit;

    let dbQuery = supabase.from("products").select("*", { count: "exact" });

    if (filters.category) {
      dbQuery = dbQuery.eq("category", filters.category);
    }

    if (filters.subcategory) {
      dbQuery = dbQuery.eq("subcategory", filters.subcategory);
    }

    if (filters.colors && filters.colors.length > 0) {
      dbQuery = dbQuery.overlaps("colors", filters.colors);
    }

    if (filters.sizes && filters.sizes.length > 0) {
      dbQuery = dbQuery.overlaps("sizes", filters.sizes);
    }

    const searchTerm = filters.search?.trim();
    if (searchTerm && searchTerm.length > 0) {
      dbQuery = dbQuery.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
      );
    }

    const selectedSort = filters.sort || "most-popular";
    if (selectedSort === "price-low") {
      dbQuery = dbQuery.order("price", { ascending: true });
    } else if (selectedSort === "price-high") {
      dbQuery = dbQuery.order("price", { ascending: false });
    } else if (selectedSort === "newest") {
      dbQuery = dbQuery.order("created_at", { ascending: false });
    } else {
      dbQuery = dbQuery.order("order_count", { ascending: false });
    }

    const { data: rawProducts, count, error } = await dbQuery.range(skip, skip + limit - 1);
    if (error) throw error;

    const total = count || 0;
    const products = (rawProducts || []).map(mapProduct);

    // Fetch categories for discount calculation
    const { data: rawCategories } = await supabase
      .from("categories")
      .select("name, discount, discount_type");

    const categories = (rawCategories || []).map(mapCategory);
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const sanitizedProducts = products.map((product: any) => {
      return calculateProductPrice(product, categoryMap);
    });

    return {
      products: JSON.parse(JSON.stringify(sanitizedProducts)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching products:", (error as any)?.message || error);
    return {
      products: [],
      pagination: {
        page,
        limit: 16,
        total: 0,
        pages: 0,
      },
    };
  }
}

async function getFiltersData() {
  const [categoriesRes, colorsRes, sizesRes] = await Promise.all([
    supabase.from("categories").select("*").order("name", { ascending: true }),
    supabase.from("colors").select("*").order("name", { ascending: true }),
    supabase.from("sizes").select("*").order("order", { ascending: true }).order("name", { ascending: true }),
  ]);

  return {
    categories: JSON.parse(JSON.stringify((categoriesRes.data || []).map(mapCategory))),
    colors: JSON.parse(JSON.stringify((colorsRes.data || []).map(mapColor))),
    sizes: JSON.parse(JSON.stringify((sizesRes.data || []).map(mapSize))),
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
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
        <Link href="/" className="hover:text-foreground transition-colors font-semibold">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">Shop</span>
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
