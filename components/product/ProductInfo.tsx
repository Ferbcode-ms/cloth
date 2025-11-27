"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { ShoppingCart, Check, AlertCircle, Truck, ShieldCheck, RefreshCw, Minus, Plus } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor
  );
  const allSizes = selectedVariant?.sizes || [];
  const availableSizes = allSizes.filter((s) => s.stock > 0);
  const selectedSizeStock =
    selectedVariant?.sizes.find((s) => s.size === selectedSize)?.stock || 0;

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      if (quantity < selectedSizeStock) {
        setQuantity((prev) => prev + 1);
      } else {
        toast.warning(`Only ${selectedSizeStock} items available in stock`);
      }
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

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
    const newQuantity = currentCartQuantity + quantity;

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
      quantity: quantity,
      maxStock: selectedSizeStock,
    });

    if (success) {
      toast.success("Product added to cart!");
    } else {
      toast.error("Failed to add product to cart. Stock limit exceeded.");
    }
  };

  return (
    <div className="flex flex-col space-y-8 ml-2">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-foreground uppercase">
          {product.title}
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <p className="text-2xl sm:text-3xl font-semibold text-primary">
            ₹ {product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <Separator />

      {/* Color Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Color : <span className="text-foreground font-semibold">{selectedColor}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant.color}
              onClick={() => {
                setSelectedColor(variant.color);
                setSelectedSize("");
                setQuantity(1);
              }}
              className={cn(
                "group relative sm:h-12 h-8 px-2 sm:px-4 rounded-full border transition-all duration-200 flex items-center gap-2",
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
              Size : <span className="text-foreground font-semibold uppercase">{selectedSize || "Select"}</span>
            </span>
            
          </div>
          
          <div className="flex gap-3">
            {allSizes.map((sizeVariant) => {
              const isSelected = selectedSize === sizeVariant.size;
              const isOutOfStock = sizeVariant.stock === 0;
              const isLowStock = sizeVariant.stock > 0 && sizeVariant.stock < 5;

              return (
                <button
                  key={sizeVariant.size}
                  onClick={() => {
                    setSelectedSize(sizeVariant.size);
                    setQuantity(1);
                  }}
                  disabled={isOutOfStock}
                  className={cn(
                    "relative   sm:h-12 h-10 w-12 sm:w-14 rounded-lg border flex items-center justify-center transition-all duration-200",
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

          {/* Variant Out of Stock Alert */}
          {allSizes.every((s) => s.stock === 0) && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertDescription>
                 This color is currently out of stock in all sizes.
               </AlertDescription>
             </Alert>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-4">
        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Quantity
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-full bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-full hover:bg-muted"
              onClick={() => handleQuantityChange("decrement")}
              disabled={!selectedSize || quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium text-lg">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-r-full hover:bg-muted"
              onClick={() => handleQuantityChange("increment")}
              disabled={!selectedSize || quantity >= selectedSizeStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {selectedSize && (
            <span className="text-sm text-muted-foreground">
              {selectedSizeStock} available
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4 sm:pt-2 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize || selectedSizeStock === 0}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:scale-[1.01] bg-gradient-to-r from-primary to-primary/90"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
        
        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground group cursor-help">
            <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <Truck className="h-5 w-5 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-muted-foreground group cursor-help">
            <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <ShieldCheck className="h-5 w-5 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium">Secure Checkout</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-muted-foreground group cursor-help">
            <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <RefreshCw className="h-5 w-5 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium">Easy Returns</span>
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
