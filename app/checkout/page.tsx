"use client";

// import Script from "next/script"; // reCAPTCHA disabled
import { useState, useEffect } from "react";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { getCart, getCartTotal } from "@/lib/utils/cart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export default function CheckoutPage() {
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

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    setMounted(true);
    const initialCart = getCart();
    setCart(initialCart);
    setTotal(getCartTotal());

    const handleStorageChange = () => {
      setCart(getCart());
      setTotal(getCartTotal());
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-muted rounded"></div>
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
            Add some products to checkout!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* reCAPTCHA script disabled for now */}
      {/* {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="beforeInteractive"
        />
      )} */}
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-medium mb-8 sm:mb-12 text-foreground uppercase">
          Checkout
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          <div className="lg:col-span-2">
            <CheckoutForm recaptchaSiteKey={RECAPTCHA_SITE_KEY} />
          </div>
          <div className="lg:col-span-1">
            <div className="border rounded-sm p-6 sticky top-8">
              <h2 className="text-xl sm:text-2xl font-medium mb-2 uppercase">
                Order Summary
              </h2>
              <p className="text-sm text-foreground/60 mb-6">
                Review your order before checkout
              </p>
              <div className="space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}-${index}`}
                      className="flex gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-muted/20 rounded-sm overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate uppercase">
                          {item.title}
                        </h3>
                        <p className="text-xs text-foreground/60 uppercase">
                          {item.color} / {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-foreground/60 uppercase">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
