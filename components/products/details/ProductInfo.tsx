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
    originalPrice?: number;
    discount?: number;
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
  const [selectedSize, setSelectedSize] = useState(
    product.variants[0]?.sizes[0]?.size || ""
  );
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
  }

// Helper function to map color names to actual colors
const getColorValue = (colorName: string): string => {
  // If it's already a hex color code, use it directly
  if (colorName.startsWith('#')) {
    return colorName;
  }
  
  // Check if it's a valid CSS color (rgb, rgba, hsl, etc.)
  if (colorName.startsWith('rgb') || colorName.startsWith('hsl')) {
    return colorName;
  }
  
  const colorMap: Record<string, string> = {
    // Basic colors
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'purple': '#A855F7',
    'pink': '#EC4899',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'orange': '#F97316',
    'brown': '#92400E',
    'beige': '#D4C5B9',
    'navy': '#1E3A8A',
    'maroon': '#7F1D1D',
    'olive': '#84CC16',
    'teal': '#14B8A6',
    'cyan': '#06B6D4',
    'indigo': '#6366F1',
    'violet': '#8B5CF6',
    'magenta': '#D946EF',
    'gold': '#EAB308',
    'silver': '#C0C0C0',
    'cream': '#FFFDD0',
    'khaki': '#C3B091',
    'tan': '#D2B48C',
    'mint': '#98FF98',
    'lavender': '#E6E6FA',
    'coral': '#FF7F50',
    'peach': '#FFDAB9',
    'burgundy': '#800020',
    'charcoal': '#36454F',
  };
  
  const normalizedColor = colorName.toLowerCase().trim();
  return colorMap[normalizedColor] || '#888888'; // Default fallback color
};;

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
    <div className="flex flex-col space-y-6 uppercase">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-tight text-foreground">
          {product.title}
        </h1>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl sm:text-4xl font-light text-foreground">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <p className="text-lg text-muted-foreground/60 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </p>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Color Selection */}
      <div className="space-y-3">
        <label className="text-sm font-normal text-foreground/70">
          Color: <span className="text-foreground font-medium">{selectedColor}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.color}
              onClick={() => {
                setSelectedColor(variant.color);
                setSelectedSize(variant.sizes[0]?.size || "");
                setQuantity(1);
              }}
              className={cn(
                "group relative mt-2 h-11 w-11 rounded-sm border transition-all duration-200 flex items-center justify-center",
                selectedColor === variant.color
                  ? "border-foreground ring-1 ring-offset-2 ring-foreground scale-105"
                  : "border-border hover:border-foreground/50 hover:scale-105"
              )}
              style={{ 
                backgroundColor: getColorValue(variant.color),
                boxShadow: variant.color.toLowerCase() === 'white' 
                  ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' 
                  : 'none'
              }}
              title={variant.color}
            >
              {selectedColor === variant.color && (
                <Check className="h-4 w-4 text-white drop-shadow-lg" 
                  style={{
                    filter: variant.color.toLowerCase() === 'white' || 
                            variant.color.toLowerCase() === 'yellow' ||
                            variant.color.toLowerCase() === 'cream'
                      ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' 
                      : 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      {selectedVariant && (
        <div className="space-y-3">
          <label className="text-sm font-normal text-foreground/70">
            Size: <span className="text-foreground font-medium">{selectedSize || "Select a size"}</span>
          </label>
          
          <div className="flex gap-2 mt-2">
            {allSizes.map((sizeVariant) => {
              const isSelected = selectedSize === sizeVariant.size;
              const isOutOfStock = sizeVariant.stock === 0;
              const isLowStock = sizeVariant.stock > 0 && sizeVariant.stock < 5;

              return (
                <div key={sizeVariant.size} className="relative group">
                  <button
                    onClick={() => {
                      setSelectedSize(sizeVariant.size);
                      setQuantity(1);
                    }}
                    disabled={isOutOfStock}
                    className={cn(
                      "relative h-11 min-w-14 w-auto px-3 rounded border transition-all duration-200 flex items-center justify-center",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50",
                      isOutOfStock && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isOutOfStock && "line-through"
                    )}>
                      {sizeVariant.size}
                    </span>
                    {isLowStock && !isOutOfStock && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </button>
                  
                  {/* Out of Stock Tooltip */}
                  {isOutOfStock && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-foreground text-background text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                        Out of Stock
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stock Alerts */}
          {selectedSizeStock > 0 && selectedSizeStock < 5 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Only {selectedSizeStock} left in stock
            </div>
          )}
          
          {selectedSize && selectedSizeStock === 0 && (
            <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-2">
              <AlertCircle className="h-3.5 w-3.5" />
              This size is out of stock
            </div>
          )}

          {/* Variant Out of Stock Alert */}
          {allSizes.every((s) => s.stock === 0) && (
            <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-2">
              <AlertCircle className="h-3.5 w-3.5" />
              This color is out of stock in all sizes
            </div>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-normal text-foreground/70">Quantity</label>
        <div className="flex items-center border rounded w-fit">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 hover:bg-muted"
            onClick={() => handleQuantityChange("decrement")}
            disabled={!selectedSize || quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 hover:bg-muted"
            onClick={() => handleQuantityChange("increment")}
            disabled={!selectedSize || quantity >= selectedSizeStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-6 pt-4">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize || selectedSizeStock === 0}
          size="lg"
          className="w-full h-12 text-base font-medium rounded transition-all hover:opacity-90 bg-foreground text-background uppercase"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        
        <div className="grid grid-cols-3 gap-6 pt-2 border-t">
          <div className="flex flex-col items-center gap-2 text-center">
            <Truck className="h-5 w-5 text-foreground/60" />
            <span className="text-xs text-foreground/60">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <ShieldCheck className="h-5 w-5 text-foreground/60" />
            <span className="text-xs text-foreground/60">Secure Checkout</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <RefreshCw className="h-5 w-5 text-foreground/60" />
            <span className="text-xs text-foreground/60">Easy Returns</span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Description Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description" className="border-none">
          <AccordionTrigger className="text-sm font-normal hover:no-underline py-3 uppercase">Description</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap pt-1">
              {product.description}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping" className="border-none">
          <AccordionTrigger className="text-sm font-normal hover:no-underline py-3 uppercase">Shipping & Returns</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-foreground/70 pt-1">
              Free standard shipping on all orders. Returns accepted within 30 days of delivery.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
