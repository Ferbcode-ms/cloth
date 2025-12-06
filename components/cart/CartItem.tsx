"use client";

import Image from "next/image";
import { toast } from "react-toastify";
import { AlertCircle, Trash2 } from "lucide-react";
import { updateCartItemQuantity, removeFromCart } from "@/lib/utils/cart";

interface CartItemProps {
  item: {
    productId: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    color: string;
    size: string;
  };
  maxStock?: number;
  onUpdate: () => void;
}

export default function CartItem({ item, maxStock, onUpdate }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    // Validate stock if maxStock is provided
    if (maxStock !== undefined && newQuantity > maxStock) {
      toast.error(
        `Only ${maxStock} item(s) available in stock. Cannot increase quantity.`
      );
      return;
    }

    const success = updateCartItemQuantity(
      item.productId,
      item.color,
      item.size,
      newQuantity,
      maxStock
    );

    if (success) {
      onUpdate();
    } else {
      toast.error("Failed to update quantity. Stock limit exceeded.");
    }
  };

  const handleRemove = () => {
    removeFromCart(item.productId, item.color, item.size);
    // cartUpdated event will trigger update in parent component
    // No need to call onUpdate() here to avoid duplicate updates
  };

  const isOutOfStock = maxStock !== undefined && maxStock === 0;
  const exceedsStock = maxStock !== undefined && item.quantity > maxStock;
  const hasStockIssue = isOutOfStock || exceedsStock;

  return (
    <div
      className={`border-b border-border last:border-b-0 ${
        isOutOfStock ? "bg-muted/20" : ""
      }`}
    >
      <div
        className={`flex items-start gap-4 sm:gap-6 p-4 sm:p-6 ${
          isOutOfStock ? "opacity-60" : ""
        }`}
      >
        {/* Product Image */}
        <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-muted/20 rounded-sm overflow-hidden ${isOutOfStock ? "grayscale" : ""}`}>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm sm:text-base font-medium mb-1 uppercase ${
              isOutOfStock
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {item.title}
          </h3>
          <p
            className={`text-xs sm:text-sm mb-2 uppercase ${
              isOutOfStock ? "text-muted-foreground" : "text-foreground/60"
            }`}
          >
            {item.color} / {item.size}
          </p>
          <p
            className={`text-base sm:text-lg font-medium ${
              isOutOfStock ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            ₹{item.price.toLocaleString("en-IN")}
          </p>

          {/* Stock Warning - Inline */}
          {hasStockIssue && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {isOutOfStock
                  ? "Out of stock"
                  : `Only ${maxStock} available (you have ${item.quantity})`}
              </span>
            </div>
          )}
        </div>

        {/* Quantity & Actions */}
        <div className="flex flex-col items-end gap-3 sm:gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center border rounded">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isOutOfStock}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${
                isOutOfStock
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              −
            </button>
            <span
              className={`w-10 text-center text-sm font-medium ${
                isOutOfStock ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isOutOfStock}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${
                isOutOfStock
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <p
            className={`text-base sm:text-lg font-medium ${
              isOutOfStock ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
          </p>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className={`flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70 ${
              isOutOfStock
                ? "text-red-600 dark:text-red-400"
                : "text-foreground/60"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="uppercase">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
