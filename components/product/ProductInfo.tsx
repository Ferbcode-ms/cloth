"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ShoppingCart, Check, AlertCircle, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { addToCart, getCart } from "@/lib/utils/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductInfoProps {
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    variants: Array<{
      color: string;
      sizes: Array<{ size: string; stock: number }>;
    }>;
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.variants[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState("");

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor
  );
  const allSizes = selectedVariant?.sizes || [];
  const availableSizes = allSizes.filter((s) => s.stock > 0);
  const selectedSizeStock =
    selectedVariant?.sizes.find((s) => s.size === selectedSize)?.stock || 0;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.warning("Please select color and size");
      return;
    }

    if (selectedSizeStock === 0) {
      toast.error("This variant is out of stock");
      return;
    }

    const cart = getCart();
    const existingItem = cart.find(
      (item) =>
        item.productId === product._id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );
    const currentCartQuantity = existingItem?.quantity || 0;
    const newQuantity = currentCartQuantity + 1;

    if (newQuantity > selectedSizeStock) {
      toast.error(
        `Only ${selectedSizeStock} item(s) available in stock. You already have ${currentCartQuantity} in your cart.`
      );
      return;
    }

    const success = addToCart({
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      maxStock: selectedSizeStock,
    });

    if (success) {
      toast.success("Product added to cart!");
    } else {
      toast.error("Failed to add product to cart. Stock limit exceeded.");
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground uppercase">
          {product.title}
        </h1>
        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-semibold text-primary">
            ₹ {product.price.toLocaleString("en-IN")}
          </p>
          <Badge variant="outline" className="text-xs uppercase tracking-wider">
            In Stock
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Color Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Color: <span className="text-foreground font-semibold">{selectedColor}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant.color}
              onClick={() => {
                setSelectedColor(variant.color);
                setSelectedSize("");
              }}
              className={cn(
                "group relative h-12 px-4 rounded-full border transition-all duration-200 flex items-center gap-2",
                selectedColor === variant.color
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent"
              )}
            >
              {selectedColor === variant.color && (
                <Check className="h-4 w-4 text-primary animate-in zoom-in" />
              )}
              <span className={cn(
                "text-sm font-medium",
                selectedColor === variant.color ? "text-primary" : "text-foreground"
              )}>
                {variant.color}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      {selectedVariant && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Size: <span className="text-foreground font-semibold">{selectedSize || "Select"}</span>
            </span>
            <button className="text-xs underline text-muted-foreground hover:text-primary transition-colors">
              Size Guide
            </button>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {allSizes.map((sizeVariant) => {
              const isSelected = selectedSize === sizeVariant.size;
              const isOutOfStock = sizeVariant.stock === 0;
              const isLowStock = sizeVariant.stock > 0 && sizeVariant.stock < 5;

              return (
                <button
                  key={sizeVariant.size}
                  onClick={() => setSelectedSize(sizeVariant.size)}
                  disabled={isOutOfStock}
                  className={cn(
                    "relative h-12 rounded-lg border flex items-center justify-center transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                      : "border-input hover:border-primary/50 hover:bg-accent",
                    isOutOfStock && "opacity-40 cursor-not-allowed bg-muted"
                  )}
                >
                  <span className="text-sm font-medium">{sizeVariant.size}</span>
                  {isLowStock && !isOutOfStock && (
                    <span className="absolute -top-2 -right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stock Alerts */}
          {selectedSizeStock > 0 && selectedSizeStock < 5 && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Hurry! Only {selectedSizeStock} left in stock.
              </AlertDescription>
            </Alert>
          )}
          
          {selectedSize && selectedSizeStock === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This size is currently out of stock.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 pt-4">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize || selectedSizeStock === 0}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:scale-[1.01]"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
        
        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5" />
            <span className="text-xs">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs">Secure Checkout</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-5 w-5" />
            <span className="text-xs">Easy Returns</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger className="text-base font-medium">Description</AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger className="text-base font-medium">Shipping & Returns</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Free standard shipping on all orders. Returns accepted within 30 days of delivery.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
