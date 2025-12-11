
export interface ProductPriceInfo {
  price: number;
  originalPrice?: number;
  discount: number;
  discountType: "percentage" | "fixed";
}

/**
 * Calculates the final price of a product based on product-level or category-level discounts.
 * 
 * @param product The product object containing price and discount details.
 * @param categoryMap A map of category names to category objects (containing discount info).
 * @returns The product with updated price, originalPrice, and discount details.
 */
export function calculateProductPrice(product: any, categoryMap: Map<string, any>): any {
  // Create a shallow copy to avoid mutating the original object if needed
  // (though the typical pattern in the codebase seems to be mapping over objects)
  const updatedProduct = { ...product };

  let finalPrice = updatedProduct.price;
  let discountAmount = 0;
  let hasDiscount = false;
  let appliedDiscount = 0;
  let appliedDiscountType = "percentage";

  // 1. Check Product Discount
  if (updatedProduct.discount > 0) {
    hasDiscount = true;
    appliedDiscount = updatedProduct.discount;
    appliedDiscountType = updatedProduct.discountType || "percentage";
    
    if (appliedDiscountType === "fixed") {
      discountAmount = appliedDiscount;
    } else {
      discountAmount = (updatedProduct.price * appliedDiscount) / 100;
    }
  } 
  // 2. Check Category Discount (only if no product discount)
  else if (updatedProduct.category && categoryMap.has(updatedProduct.category)) {
    const cat = categoryMap.get(updatedProduct.category);
    if (cat && cat.discount > 0) {
      hasDiscount = true;
      appliedDiscount = cat.discount;
      appliedDiscountType = cat.discountType || "percentage";
      
      // Attach discount info to product so UI can display it
      updatedProduct.discount = appliedDiscount;
      updatedProduct.discountType = appliedDiscountType;

      if (appliedDiscountType === "fixed") {
        discountAmount = appliedDiscount;
      } else {
        discountAmount = (updatedProduct.price * appliedDiscount) / 100;
      }
    }
  }

  if (hasDiscount) {
    finalPrice = Math.max(0, updatedProduct.price - discountAmount);
    updatedProduct.originalPrice = updatedProduct.price;
    updatedProduct.price = finalPrice;
  }
  
  return updatedProduct;
}
