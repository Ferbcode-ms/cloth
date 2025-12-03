"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductsClientProps {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ProductsClient({
  products,
  pagination,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = pagination.page;
  const totalPages = pagination.pages;
  const sortBy = searchParams.get("sort") || "most-popular";

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1"); // Reset to first page when sorting
    // Use replace instead of push for smoother navigation
    router.replace(`/products?${params.toString()}`);
  };

  const buildPaginationUrl = (page: number) => {
    // Ensure page is valid (at least 1 and not more than total pages)
    const validPage = Math.max(1, Math.min(page, totalPages));
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", validPage.toString());
    return `/products?${params.toString()}`;
  };

  // Calculate pagination range
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPages = 7; // Show max 7 page numbers

    if (totalPages <= maxPages) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(currentPage * pagination.limit, pagination.total);

  return (
    <div className="flex-1 space-y-2 sm:space-y-6">
      {/* Category Title */}
      {/* Category Title */}
      <h2 className="text-2xl sm:text-3xl font-semibold uppercase">
        {searchParams.get("search")
          ? `Search Results for "${searchParams.get("search")}"`
          : searchParams.get("category")
          ? `${searchParams.get("category")} Products`
          : "All Products"}
      </h2>

      {/* Product Count and Sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {pagination.total} Products
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Sort by:
          </span>
          <Select value={sortBy} onValueChange={updateSort}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most-popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 gap-4 mt-6 sm:mt-0">
        {products.map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
          {currentPage === 1 ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPaginationUrl(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            </Button>
          )}

          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="sm"
                asChild
                className={isActive ? "" : "bg-transparent"}
              >
                <Link href={buildPaginationUrl(pageNum)}>{pageNum}</Link>
              </Button>
            );
          })}

          {currentPage === totalPages ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPaginationUrl(currentPage + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
