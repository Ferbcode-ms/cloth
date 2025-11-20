import { Suspense } from "react";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Link from "next/link";
import ProductsFilters from "@/components/ProductsFilters";
import ProductsClient from "@/components/ProductsClient";
import ProductsFiltersSkeleton from "@/components/ProductsFiltersSkeleton";
import ProductsGridSkeleton from "@/components/ProductsGridSkeleton";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const revalidate = 3600; // Revalidate every hour

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    subcategory?: string;
    colors?: string;
    sizes?: string;
    sort?: string;
    search?: string;
  }>;
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
    await connectDB();
    const limit = 9; // Changed to 9 to match 3x3 grid
    const skip = (page - 1) * limit;

    const query: any = {};

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

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    let sortQuery: any = { createdAt: -1 }; // Default sort
    if (filters.sort === "price-low") {
      sortQuery = { price: 1 };
    } else if (filters.sort === "price-high") {
      sortQuery = { price: -1 };
    } else if (filters.sort === "newest") {
      sortQuery = { createdAt: -1 };
    } else if (filters.sort === "most-popular") {
      // For now, use createdAt as popularity proxy
      sortQuery = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return {
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  // Ensure page is at least 1, default to 1 if invalid
  const pageParam = parseInt(params.page || "1");
  const page = pageParam > 0 ? pageParam : 1;
  const category = params.category;
  const subcategory = params.subcategory;
  const colors = params.colors?.split(",").filter(Boolean);
  const sizes = params.sizes?.split(",").filter(Boolean);
  const sort = params.sort || "most-popular";
  const search = params.search || "";

  const { products, pagination } = await getProducts(page, {
    category,
    subcategory,
    colors,
    sizes,
    sort,
    search,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-4 sm:py-12 lg:py-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 sm:mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Shop</span>
      </div>

      {/* Search Bar */}
      <form
        action="/products"
        method="get"
        className="w-full max-w-xl  sm:mb-8 mb-4 relative"
      >
        {/* Preserve existing filters when searching */}
        {category && <input type="hidden" name="category" value={category} />}
        {subcategory && (
          <input type="hidden" name="subcategory" value={subcategory} />
        )}
        {params.colors && (
          <input type="hidden" name="colors" value={params.colors} />
        )}
        {params.sizes && (
          <input type="hidden" name="sizes" value={params.sizes} />
        )}
        {params.sort && <input type="hidden" name="sort" value={params.sort} />}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search for products..."
          className="pl-10 w-full sm:w-1/2 bg-muted/50 border-border"
        />
      </form>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <Suspense fallback={<ProductsFiltersSkeleton />}>
            <ProductsFilters />
          </Suspense>
        </aside>

        {/* Products Content */}
        <main className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
              <Link
                href="/products"
                className="text-sm text-foreground hover:underline mt-4 inline-block"
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
