"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getCart, getCartTotal } from "@/lib/utils/cart";
import CartItem from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

interface ProductStock {
  [productId: string]: {
    [color: string]: {
      [size: string]: number;
    };
  };
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<
    Array<{
      productId: string;
      title: string;
      price: number;
      image: string;
      quantity: number;
      color: string;
      size: string;
    }>
  >([]);
  const [total, setTotal] = useState(0);
  const [productStocks, setProductStocks] = useState<ProductStock>({});
  const fetchingRef = useRef(false);

  // Fetch product stock information for all cart items
  const fetchProductStocks = async (cartItems: typeof cart) => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;

    if (cartItems.length === 0) {
      setProductStocks({});
      return;
    }

    fetchingRef.current = true;
    const uniqueProductIds = [
      ...new Set(cartItems.map((item) => item.productId)),
    ];
    const stocks: ProductStock = {};

    try {
      for (const productId of uniqueProductIds) {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.product;
            if (product && product.variants) {
              stocks[productId] = {};
              product.variants.forEach((variant: any) => {
                stocks[productId][variant.color] = {};
                variant.sizes.forEach((size: any) => {
                  stocks[productId][variant.color][size.size] = size.stock;
                });
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }
      setProductStocks(stocks);
    } finally {
      fetchingRef.current = false;
    }
  };

  const updateCart = () => {
    const updatedCart = getCart();
    setCart(updatedCart);
    setTotal(getCartTotal());
    // Fetch stocks only when cart actually changes
    fetchProductStocks(updatedCart);
  };

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    setMounted(true);
    const initialCart = getCart();
    setCart(initialCart);
    setTotal(getCartTotal());

    if (initialCart.length > 0) {
      fetchProductStocks(initialCart);
    }

    const handleStorageChange = () => {
      const updatedCart = getCart();
      setCart(updatedCart);
      setTotal(getCartTotal());
      fetchProductStocks(updatedCart);
    };

    const handleCartUpdate = () => {
      updateCart();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-md mx-auto space-y-8">
          <ShoppingBag className="h-20 w-20 mx-auto text-foreground/30" />
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground uppercase">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-foreground/60">
            Add some products to get started!
          </p>
          <Button asChild size="lg" className="rounded bg-foreground text-background hover:opacity-90 uppercase">
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      <h1 className="text-3xl sm:text-4xl font-medium mb-8 sm:mb-12 text-foreground uppercase">
        Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="border rounded-sm">
            {cart.map((item, index) => {
              const maxStock =
                productStocks[item.productId]?.[item.color]?.[item.size];
              return (
                <CartItem
                  key={`${item.productId}-${item.color}-${item.size}-${index}`}
                  item={item}
                  maxStock={maxStock}
                  onUpdate={updateCart}
                />
              );
            })}
          </div>
          {/* Stock validation warnings */}
          {cart.some((item) => {
            const maxStock =
              productStocks[item.productId]?.[item.color]?.[item.size];
            return (
              maxStock !== undefined &&
              (maxStock === 0 || item.quantity > maxStock)
            );
          }) && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Some items have stock issues. Please review before checkout.
              </span>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="border rounded-sm p-6 sticky top-8">
            <h2 className="text-xl sm:text-2xl font-medium mb-6 uppercase">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60 uppercase">Subtotal</span>
                  <span className="text-foreground font-medium">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60 uppercase">Shipping</span>
                  <span className="text-foreground/60">Free (COD)</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground uppercase">Total</span>
                  <span className="text-foreground">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="space-y-3 pt-6">
                {(() => {
                  const hasStockIssues = cart.some((item) => {
                    const maxStock =
                      productStocks[item.productId]?.[item.color]?.[item.size];
                    return (
                      maxStock !== undefined &&
                      (maxStock === 0 || item.quantity > maxStock)
                    );
                  });
                  return hasStockIssues ? (
                    <Button
                      size="lg"
                      className="w-full rounded h-12 text-base font-medium bg-foreground/50 text-background uppercase"
                      disabled
                      onClick={() => {
                        toast.error(
                          "Please fix stock issues in your cart before checkout"
                        );
                      }}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Cannot Checkout
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className="w-full rounded h-12 text-base font-medium bg-foreground text-background hover:opacity-90 uppercase"
                    >
                      <Link href="/checkout">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Book Now
                      </Link>
                    </Button>
                  );
                })()}
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded uppercase"
                >
                  <Link href="/products">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
