"use client";

import { useEffect, useState } from "react";
import { getCartItemCount } from "@/lib/utils/cart";

export default function CartIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(getCartItemCount());
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    // Custom event for same-tab updates
    window.addEventListener("cartUpdated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, []);

  return (
    <div className="relative flex items-center gap-2">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-textPrimary text-white text-[10px] w-4 h-4 flex items-center justify-center">
          {count}
        </span>
      )}
      <span className="text-sm">Cart</span>
    </div>
  );
}
