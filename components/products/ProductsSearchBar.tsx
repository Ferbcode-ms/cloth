"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";

import { Input } from "@/components/ui/input";

interface ProductsSearchBarProps {
  initialValue: string;
}

export default function ProductsSearchBar({
  initialValue,
}: ProductsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const serializedParams = searchParams.toString();

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(serializedParams);
      const currentSearch = params.get("search") || "";
      const newSearch = query.trim();

      if (currentSearch !== newSearch) {
        if (newSearch) {
          params.set("search", newSearch);
        } else {
          params.delete("search");
        }

        params.set("page", "1");

        startTransition(() => {
          router.replace(`/products?${params.toString()}`);
        });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query, router, serializedParams]);

  return (
    <div className=" sm:mb-8 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for products..."
          className="pl-10 pr-10 bg-muted/50 border-border"
          aria-label="Search products"
        />
        {isPending ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : query ? (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
