"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

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

      if (query.trim()) {
        params.set("search", query.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      const next = params.toString();
      if (next === serializedParams) {
        return;
      }

      startTransition(() => {
        router.replace(`/products?${next}`);
      });
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
          className="pl-10  bg-muted/50 border-border"
          aria-label="Search products"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
    </div>
  );
}
