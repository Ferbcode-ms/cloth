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
    <div className="flex flex-col space-y-8 ml-2">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-foreground uppercase">
          {product.title}
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <p className="text-2xl sm:text-3xl font-medium text-primary">
            ₹ {product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <Separator />

      {/* Color Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Color : <span className="text-foreground ">{selectedColor}</span>
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
                "group cursor-pointer relative sm:h-10 sm:w-10 h-8 w-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                selectedColor === variant.color
                  ? "border-primary ring-2 ring-primary/30 scale-110"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:scale-105"
              )}
              style={{ 
                backgroundColor: getColorValue(variant.color),
                boxShadow: variant.color.toLowerCase() === 'white' 
                  ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' 
                  : 'none'
              }}
              title={variant.color} // Tooltip shows color name on hover
            >
              {selectedColor === variant.color && (
                <Check className="h-5 w-5 text-white drop-shadow-lg animate-in zoom-in" 
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Size : <span className="text-foreground uppercase">{selectedSize || "Select"}</span>
            </span>
            
          </div>
          
          <div className="flex gap-3">
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
                      "relative sm:h-10 cursor-pointer h-8 w-10 sm:w-12 rounded-lg border flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-input hover:border-primary/50 hover:bg-accent",
                      isOutOfStock && "opacity-40 cursor-not-allowed bg-muted"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isOutOfStock && "line-through decoration-2"
                    )}>
                      {sizeVariant.size}
                    </span>
                    {isLowStock && !isOutOfStock && (
                      <span className="absolute -top-2 -right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    )}
                  </button>
                  
                  {/* Out of Stock Tooltip */}
                  {isOutOfStock && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded whitespace-nowrap shadow-lg">
                        Out of Stock
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stock Alerts */}
          {selectedSizeStock > 0 && selectedSizeStock < 5 && (
            <Alert className="relative overflow-hidden border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm animate-in slide-in-from-top-2 duration-300 sm:w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 animate-pulse" />
              <div className="relative flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 p-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <AlertDescription className="font-medium text-amber-900 dark:text-amber-200 flex-1">
                  <span className="block text-sm">
                    ⚡ Hurry! Only <span className="font-bold text-amber-700 dark:text-amber-300">{selectedSizeStock}</span> left in stock
                  </span>
                  <span className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 block">
                    Order now before it's gone!
                  </span>
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          {selectedSize && selectedSizeStock === 0 && (
            <Alert className="relative overflow-hidden border-0 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 shadow-sm animate-in slide-in-from-top-2 duration-300 sm:w-1/2">
              <div className="relative flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-red-100 dark:bg-red-900/50 p-1.5">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <AlertDescription className="font-medium text-red-900 dark:text-red-200 flex-1">
                  <span className="block text-sm">
                    😔 This size is currently out of stock
                  </span>
                  <span className="text-xs text-red-700/80 dark:text-red-300/80 mt-1 block">
                    Try selecting a different size or color
                  </span>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Variant Out of Stock Alert */}
          {allSizes.every((s) => s.stock === 0) && (
             <Alert className="relative overflow-hidden border-0 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 shadow-sm animate-in slide-in-from-top-2 duration-300 sm:w-1/2">
               <div className="relative flex items-start gap-3">
                 <div className="mt-0.5 rounded-full bg-red-100 dark:bg-red-900/50 p-1.5">
                   <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                 </div>
                 <AlertDescription className="font-medium text-red-900 dark:text-red-200 flex-1">
                   <span className="block text-sm">
                     😔 This color is currently out of stock in all sizes
                   </span>
                   <span className="text-xs text-red-700/80 dark:text-red-300/80 mt-1 block">
                     Please choose a different color option
                   </span>
                 </AlertDescription>
               </div>
             </Alert>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-4">
        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Quantity
        </span>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border rounded-full bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-full hover:bg-muted cursor-pointer"
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
              className="h-10 w-10 rounded-r-full hover:bg-muted cursor-pointer"
              onClick={() => handleQuantityChange("increment")}
              disabled={!selectedSize || quantity >= selectedSizeStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4 sm:pt-2 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize || selectedSizeStock === 0}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:scale-[1.01] bg-gradient-to-r from-primary to-primary/90 sm:w-1/2 cursor-pointer"
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
      <Accordion type="single" collapsible className="w-full ">
        <AccordionItem value="description">
          <AccordionTrigger className="text-base font-medium uppercase">Description</AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping">
          <AccordionTrigger className="text-base font-medium uppercase">Shipping & Returns</AccordionTrigger>
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
