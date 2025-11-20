"use client";

import Image from "next/image";
import { toast } from "react-toastify";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
        isOutOfStock ? "bg-muted/30 opacity-60" : ""
      }`}
    >
      {hasStockIssue && (
        <Alert variant="destructive" className="m-4 mb-0 w-1/2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isOutOfStock
              ? "This item is out of stock. Please remove it from your cart."
              : `Only ${maxStock} item(s) available. You have ${item.quantity} in cart.`}
          </AlertDescription>
        </Alert>
      )}
      <div
        className={`flex items-center gap-3 sm:gap-6 p-2 sm:p-6 ${
          isOutOfStock ? "grayscale" : ""
        }`}
      >
        <div className="relative w-24 h-24 bg-accent">
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
              <span className="text-textSecondary text-xs">No Image</span>
            </div>
          )}
        </div>
        <div className="flex-1 ">
          <h3
            className={`text-sm font-light mb-1 ${
              isOutOfStock
                ? "text-muted-foreground line-through"
                : "text-textPrimary"
            }`}
          >
            {item.title}
          </h3>
          <p
            className={`text-xs mb-2 ${
              isOutOfStock ? "text-muted-foreground" : "text-textSecondary"
            }`}
          >
            {item.color} - {item.size}
          </p>
          <p
            className={`text-sm font-light ${
              isOutOfStock ? "text-muted-foreground" : "text-textPrimary"
            }`}
          >
            ₹ {item.price}
          </p>
        </div>
        <div className="flex items-center flex-col sm:flex-row gap-1 sm:gap-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isOutOfStock}
            className={`w-8 h-8 border border-border transition-opacity duration-200 ${
              isOutOfStock
                ? "text-muted-foreground cursor-not-allowed opacity-50"
                : "text-textSecondary hover:text-textPrimary hover:opacity-80"
            }`}
          >
            -
          </button>
          <span
            className={`w-8 text-center text-sm ${
              isOutOfStock ? "text-muted-foreground" : "text-textPrimary"
            }`}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isOutOfStock}
            className={`w-8 h-8 border border-border transition-opacity duration-200 ${
              isOutOfStock
                ? "text-muted-foreground cursor-not-allowed opacity-50"
                : "text-textSecondary hover:text-textPrimary hover:opacity-80"
            }`}
          >
            +
          </button>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-light mb-2 ${
              isOutOfStock ? "text-muted-foreground" : "text-textPrimary"
            }`}
          >
            ₹ {item.price * item.quantity}
          </p>
          <button
            onClick={handleRemove}
            className={`text-xs transition-opacity duration-200 hover:opacity-80 ${
              isOutOfStock
                ? "text-destructive hover:text-destructive/80 font-medium"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {isOutOfStock ? "Remove (Out of Stock)" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
