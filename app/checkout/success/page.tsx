"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
      <div className="max-w-lg mx-auto">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-serif font-light">
              Order Placed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              Thank you for your order. We will contact you soon for delivery.
            </p>
            {orderId && (
              <div className="bg-muted/50 rounded-md p-4">
                <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono text-sm font-medium text-foreground">
                  {orderId}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          Loading...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
