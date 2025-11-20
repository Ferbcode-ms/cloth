export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  size: string;
}

const CART_STORAGE_KEY = "cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (
  item: Omit<CartItem, "quantity"> & { quantity?: number; maxStock?: number }
): boolean => {
  if (typeof window === "undefined") return false;

  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    (i) =>
      i.productId === item.productId &&
      i.color === item.color &&
      i.size === item.size
  );

  const quantityToAdd = item.quantity || 1;
  const currentQuantity =
    existingItemIndex > -1 ? cart[existingItemIndex].quantity : 0;
  const newQuantity = currentQuantity + quantityToAdd;

  // Validate stock if maxStock is provided
  if (item.maxStock !== undefined && newQuantity > item.maxStock) {
    return false; // Stock limit exceeded
  }

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity = newQuantity;
  } else {
    cart.push({ ...item, quantity: quantityToAdd });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  // Dispatch event to update cart count in navbar
  window.dispatchEvent(new Event("cartUpdated"));
  return true;
};

export const removeFromCart = (
  productId: string,
  color: string,
  size: string
): void => {
  if (typeof window === "undefined") return;

  const cart = getCart();
  const filteredCart = cart.filter(
    (item) =>
      !(
        item.productId === productId &&
        item.color === color &&
        item.size === size
      )
  );
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filteredCart));
  // Dispatch event to update cart count in navbar
  window.dispatchEvent(new Event("cartUpdated"));
};

export const updateCartItemQuantity = (
  productId: string,
  color: string,
  size: string,
  quantity: number,
  maxStock?: number
): boolean => {
  if (typeof window === "undefined") return false;

  const cart = getCart();
  const itemIndex = cart.findIndex(
    (item) =>
      item.productId === productId && item.color === color && item.size === size
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return true;
    }

    // Validate stock if maxStock is provided
    if (maxStock !== undefined && quantity > maxStock) {
      return false; // Stock limit exceeded
    }

    cart[itemIndex].quantity = quantity;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event("cartUpdated"));
    return true;
  }
  return false;
};

export const clearCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
  // Dispatch event to update cart count in navbar
  window.dispatchEvent(new Event("cartUpdated"));
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  // Return number of unique items (not total quantity)
  return cart.length;
};

export const getCartTotalQuantity = (): number => {
  const cart = getCart();
  // Return total quantity of all items
  return cart.reduce((count, item) => count + item.quantity, 0);
};
