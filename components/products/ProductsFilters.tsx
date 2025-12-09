"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ChevronRight, SlidersHorizontal } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Color {
  _id: string;
  name: string;
  value: string;
  hex: string;
}

interface Size {
  _id: string;
  name: string;
  value: string;
  order?: number;
}

interface ProductsFiltersProps {
  categories: Category[];
  colors: Color[];
  sizes: Size[];
}

export default function ProductsFilters({
  categories,
  colors,
  sizes,
}: ProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategoryName, setSelectedCategoryName] = useState(
    searchParams.get("category") || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    searchParams.get("subcategory") || ""
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get("colors")?.split(",").filter(Boolean) || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get("sizes")?.split(",").filter(Boolean) || []
  );

  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Auto-apply filters when they change
  const applyFilters = useCallback(() => {
    // Skip on initial mount to avoid unnecessary navigation
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    // Initialize with current params to preserve search, sort, etc.
    const params = new URLSearchParams(searchParams.toString());

    // Update filter params
    if (selectedCategoryName) {
      params.set("category", selectedCategoryName);
    } else {
      params.delete("category");
    }

    if (selectedSubcategory) {
      params.set("subcategory", selectedSubcategory);
    } else {
      params.delete("subcategory");
    }

    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    } else {
      params.delete("colors");
    }

    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    } else {
      params.delete("sizes");
    }

    params.set("page", "1"); // Reset to first page
    router.push(`/products?${params.toString()}`);
  }, [
    selectedCategoryName,
    selectedSubcategory,
    selectedColors,
    selectedSizes,
    router,
    isInitialMount,
  ]);

  // Auto-apply filters with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [applyFilters]);

  const handleCategorySelect = (category: Category) => {
    if (selectedCategoryName === category.name) {
      setSelectedCategoryName("");
      setSelectedSubcategory("");
    } else {
      setSelectedCategoryName(category.name);
      setSelectedSubcategory("");
    }
    // Close mobile filters after selection
    setIsMobileFiltersOpen(false);
  };

  const handleSubcategorySelect = (subcategorySlug: string) => {
    setSelectedSubcategory(
      selectedSubcategory === subcategorySlug ? "" : subcategorySlug
    );
    // Close mobile filters after selection
    setIsMobileFiltersOpen(false);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    // Close mobile filters after selection
    setIsMobileFiltersOpen(false);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    // Close mobile filters after selection
    setIsMobileFiltersOpen(false);
  };

  const filtersContent = (
    <>
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Filters</h2>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Product Categories</h3>
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Loading categories...
            </p>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="space-y-1">
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "w-full flex items-center justify-between text-sm hover:text-foreground transition-colors uppercase cursor-pointer hover:translate-x-1 transition-all font-medium",
                    selectedCategoryName === category.name
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                {selectedCategoryName === category.name &&
                  category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div className="ml-4 space-y-2 mt-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.slug}
                          onClick={() => handleSubcategorySelect(sub.slug)}
                          className={cn(
                            "w-full flex items-center justify-between text-xs hover:text-foreground transition-colors font-medium uppercase cursor-pointer ",
                            selectedSubcategory === sub.slug
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>{sub.name}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Colors</h3>
        {colors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading colors...</p>
        ) : (
          <div className="grid grid-cols-8 ">
            {colors.map((color) => (
              <button
                key={color._id}
                onClick={() => toggleColor(color.value)}
                className={cn(
                  "relative h-8 w-8 rounded-none border-2 transition-all cursor-pointer",
                  selectedColors.includes(color.value)
                    ? "border-foreground scale-110"
                    : "border-border hover:border-foreground/50"
                )}
                style={{
                  backgroundColor: color.hex,
                  borderColor: color.hex === "#ffffff" ? "#e5e7eb" : undefined,
                }}
                title={color.name}
              >
                {selectedColors.includes(color.value) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Size</h3>
        {sizes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading sizes...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 mr-2">
            {sizes.map((size) => (
              <button
                key={size._id}
                onClick={() => toggleSize(size.value)}
                className={cn(
                  "px-3 py-2 text-sm border rounded-md transition-all cursor-pointer",
                  selectedSizes.includes(size.value)
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground/50"
                )}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full lg:w-80">
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
          className="w-full justify-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      <div
        className={cn(
          "space-y-8",
          "lg:space-y-8",
          !isMobileFiltersOpen ? "hidden lg:block" : "block",
          "lg:sticky lg:top-4 lg:h-fit",
          "lg:bg-transparent",
          "lg:p-0",
          "lg:shadow-none",
          "lg:border-none",
          isMobileFiltersOpen
            ? "rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
            : ""
        )}
      >
        {filtersContent}
      </div>
    </div>
  );
}
