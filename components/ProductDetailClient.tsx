"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { addToCart, getCart } from "@/lib/utils/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
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

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.variants[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

    // Check current cart quantity for this item
    const cart = getCart();
    const existingItem = cart.find(
      (item) =>
        item.productId === product._id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );
    const currentCartQuantity = existingItem?.quantity || 0;
    const newQuantity = currentCartQuantity + 1;

    // Validate stock availability
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 py-8 lg:py-12">
        {/* Image Gallery */}
        <div className="space-y-4 min-w-0">
          <Card className="relative h-[400px] sm:h-[400px] lg:h-[400px] w-full overflow-hidden rounded-lg border-0 shadow-lg bg-muted/50">
            {product.images[selectedImageIndex] ? (
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground text-sm">No Image</span>
              </div>
            )}
          </Card>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative h-20 sm:h-20 w-full rounded-md overflow-hidden border-2 transition-all duration-200 hover:opacity-80",
                    selectedImageIndex === index
                      ? "border-primary ring-1 ring-primary ring-offset-1"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-6 min-w-0">
          {/* Title and Price */}
          <div className="space-y-3">
            <h1 className="text-3xl uppercase sm:text-4xl lg:text-5xl font-serif font-light text-foreground tracking-tight leading-tight wrap-break">
              {product.title}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-2xl sm:text-3xl font-semibold text-foreground">
                ₹ {product.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Description
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed wrap-break-word whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Color :{" "}
                <span className="font-normal text-muted-foreground uppercase">
                  {selectedColor || "Select"}
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.color}
                  type="button"
                  variant={
                    selectedColor === variant.color ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSelectedColor(variant.color);
                    setSelectedSize("");
                  }}
                  className={cn(
                    "min-w-[80px] rounded-full",
                    selectedColor === variant.color &&
                      "ring-1 ring-black ring-offset-2"
                  )}
                >
                  {selectedColor === variant.color && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {variant.color}
                </Button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          {selectedVariant && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Size :{" "}
                  <span className="font-normal text-muted-foreground uppercase">
                    {selectedSize || "Select"}
                  </span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((sizeVariant, index) => {
                  const isSelected = selectedSize === sizeVariant.size;
                  const isLowStock =
                    sizeVariant.stock > 0 && sizeVariant.stock < 5;
                  const isOutOfStock = sizeVariant.stock === 0;

                  return (
                    <Button
                      key={`${selectedColor}-${sizeVariant.size}-${index}`}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(sizeVariant.size)}
                      disabled={isOutOfStock}
                      className={cn(
                        "min-w-[60px] relative rounded-full",
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        isOutOfStock && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 mr-1" />}
                      {sizeVariant.size}
                      {isOutOfStock ? (
                        <Badge
                          variant="destructive"
                          className="ml-1 text-[10px] px-1 py-0"
                        >
                          Out
                        </Badge>
                      ) : (
                        <Badge
                          variant={isLowStock ? "destructive" : "secondary"}
                          className="ml-1 text-[10px] px-1 py-0"
                        >
                          {sizeVariant.stock}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
              {allSizes.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No sizes available for this color variant.
                  </AlertDescription>
                </Alert>
              )}
              {allSizes.length > 0 && availableSizes.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All sizes for this color variant are currently out of stock.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Separator />

          {/* Stock Alert */}
          {selectedSizeStock > 0 && selectedSizeStock < 5 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only <strong>{selectedSizeStock}</strong> left in stock!
              </AlertDescription>
            </Alert>
          )}

          {selectedSizeStock === 0 && selectedSize && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This variant is currently out of stock.
              </AlertDescription>
            </Alert>
          )}

          {/* Add to Cart Button */}
          <div className="space-y-3  rounded-full">
            <Button
              onClick={handleAddToCart}
              disabled={
                !selectedColor || !selectedSize || selectedSizeStock === 0
              }
              size="lg"
              className=" h-12 text-base font-medium rounded-full"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add To Cart
            </Button>
            {(!selectedColor || !selectedSize) && (
              <p className="text-xs text-muted-foreground text-center">
                Please select color and size to add to cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
