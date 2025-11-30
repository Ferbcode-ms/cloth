"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu, ChevronDown, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import CartIcon from "@/components/CartIcon";
import { getCartItemCount } from "@/lib/utils/cart";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isDesktopShopOpen, setIsDesktopShopOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<
    { _id: string; name: string; slug: string }[]
  >([]);
  const [products, setProducts] = useState<
    { _id: string; title: string; slug: string; category: string; price: number; images: string[] }[]
  >([]);
  const [bannerSettings, setBannerSettings] = useState({
    text: "Sign up and get 20% off to your first order.",
    linkUrl: "/products",
    linkText: "Sign Up Now",
    isVisible: true,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".shop-dropdown")) {
        setIsDesktopShopOpen(false);
      }
    };

    if (isDesktopShopOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopShopOpen]);

  // Update cart count
  useEffect(() => {
    // Set mounted to true and initialize cart count
    setMounted(true);
    const updateCount = () => {
      const count = getCartItemCount();
      setCartCount(count);
    };
    updateCount();

    window.addEventListener("storage", updateCount);
    window.addEventListener("cartUpdated", updateCount);

    // Also listen for focus event to update when user returns to tab
    const handleFocus = () => {
      updateCount();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Load categories and products for Shop dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData || []);
        }

        // Fetch products (limit to recent 8 products)
        const prodRes = await fetch("/api/products?limit=8");
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }

        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData && settingsData.banner) {
            setBannerSettings(settingsData.banner);
          }
        }
      } catch (error) {
        console.error("Error fetching navbar data:", error);
      }
    };

    fetchData();
  }, []);

  
  return (
    <>
      {/* Promotional Banner */}
      {bannerSettings.isVisible && (
        <div className="bg-black text-white py-1 px-4 relative overflow-hidden">
          <div className="whitespace-nowrap">
            <div className="inline-block animate-marquee will-change-transform">
              <span className="text-sm inline-block">
                {bannerSettings.text}{" "}
                <Link
                  href={bannerSettings.linkUrl}
                  className="underline hover:no-underline transition-all"
                >
                  {bannerSettings.linkText}
                </Link>
                {" • "}
                {bannerSettings.text}{" "}
                <Link
                  href={bannerSettings.linkUrl}
                  className="underline hover:no-underline transition-all"
                >
                  {bannerSettings.linkText}
                </Link>
                {" • "}
              </span>
              <span className="text-sm inline-block ml-8">
                {bannerSettings.text}{" "}
                <Link
                  href={bannerSettings.linkUrl}
                  className="underline hover:no-underline transition-all"
                >
                  {bannerSettings.linkText}
                </Link>
                {" • "}
                {bannerSettings.text}{" "}
                <Link
                  href={bannerSettings.linkUrl}
                  className="underline hover:no-underline transition-all"
                >
                  {bannerSettings.linkText}
                </Link>
                {" • "}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="border-b border-border bg-background sticky top-0 z-50 sm:px-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity"
            >
              SHOP.CO
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              {/* Shop Dropdown */}
              <div className="relative shop-dropdown">
                <Button
                  variant="ghost"
                  onClick={() => setIsDesktopShopOpen(!isDesktopShopOpen)}
                  className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 h-auto p-0"
                >
                  Shop
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isDesktopShopOpen && "rotate-180"
                    )}
                  />
                </Button>
                <AnimatePresence>
                  {isDesktopShopOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-[600px] bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="grid grid-cols-2 gap-6 p-6">
                        {/* Categories Section */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Categories
                          </h3>
                          <div className="space-y-1">
                            {categories.length === 0 ? (
                              <span className="block text-sm text-muted-foreground">
                                No categories
                              </span>
                            ) : (
                              categories.map((category) => (
                                <Link
                                  key={category._id}
                                  href={`/products?category=${encodeURIComponent(
                                    category.name
                                  )}`}
                                  onClick={() => setIsDesktopShopOpen(false)}
                                  className="block px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                                >
                                  {category.name}
                                </Link>
                              ))
                            )}
                            <Link
                              href="/products"
                              onClick={() => setIsDesktopShopOpen(false)}
                              className="block px-3 py-2 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors mt-2"
                            >
                              View All Products →
                            </Link>
                          </div>
                        </div>

                        {/* Featured Products Section */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">
                            Featured Products
                          </h3>
                          <div className="space-y-2">
                            {products.length === 0 ? (
                              <span className="block text-sm text-muted-foreground">
                                No products
                              </span>
                            ) : (
                              products.slice(0, 4).map((product) => (
                                <Link
                                  key={product._id}
                                  href={`/products/${product.slug}`}
                                  onClick={() => setIsDesktopShopOpen(false)}
                                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors group"
                                >
                                  {product.images && product.images[0] && (
                                    <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                      <img
                                        src={product.images[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {product.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ${product.price}
                                    </p>
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              
            </div>

            {/* Right Side Icons - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/cart"
                className="relative hover:opacity-80 transition-opacity"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/admin"
                className="hover:opacity-80 transition-opacity"
                aria-label="User account"
              >
                <User className="w-5 h-5 text-foreground" />
              </Link>
            </div>

            {/* Mobile Cart & Menu */}
            <div className="flex md:hidden items-center gap-3 ml-auto">
              <Link
                href="/cart"
                className="relative inline-flex items-center gap-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:w-full p-0"
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Main navigation menu for SHOP.CO
                  </SheetDescription>
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen && (
                      <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col h-full"
                      >
                    {/* Header with Logo */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.05, duration: 0.2 }}
                      className="flex items-center justify-center px-6 py-6 border-b border-border relative"
                    >
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-bold text-foreground tracking-tight"
                      >
                        SHOP.CO
                      </Link>
                    </motion.div>

                    {/* Mobile Navigation Links */}
                    <div className="flex flex-col gap-4 px-6 py-6 overflow-y-auto">
                      {/* Shop Dropdown Mobile */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setIsMobileShopOpen(!isMobileShopOpen)
                          }
                          className="flex items-center justify-between w-full text-base font-semibold text-foreground h-auto p-0 hover:bg-transparent"
                        >
                          Shop
                          <motion.div
                            animate={{ rotate: isMobileShopOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </Button>
                        <AnimatePresence>
                          {isMobileShopOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 ml-4 flex flex-col gap-3">
                                {/* Categories */}
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                    Categories
                                  </p>
                                  {categories.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">
                                      No categories
                                    </span>
                                  ) : (
                                    <div className="space-y-2">
                                      {categories.map((category, index) => (
                                        <motion.div
                                          key={category._id}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.05 * index }}
                                        >
                                          <SheetClose asChild>
                                            <Link
                                              href={`/products?category=${encodeURIComponent(
                                                category.name
                                              )}`}
                                              className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                                            >
                                              {category.name}
                                            </Link>
                                          </SheetClose>
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Featured Products */}
                                {products.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                      Featured
                                    </p>
                                    <div className="space-y-2">
                                      {products.slice(0, 3).map((product, index) => (
                                        <motion.div
                                          key={product._id}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.05 * (categories.length + index) }}
                                        >
                                          <SheetClose asChild>
                                            <Link
                                              href={`/products/${product.slug}`}
                                              className="flex items-center gap-2 py-1 group"
                                            >
                                              {product.images && product.images[0] && (
                                                <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                                  <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                  />
                                                </div>
                                              )}
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                  {product.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  ${product.price}
                                                </p>
                                              </div>
                                            </Link>
                                          </SheetClose>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* View All Link */}
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <SheetClose asChild>
                                    <Link
                                      href="/products"
                                      className="block text-sm font-semibold text-primary hover:underline mt-2"
                                    >
                                      View All Products →
                                    </Link>
                                  </SheetClose>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* User Account Link */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: 0.15, duration: 0.2 }}
                      >
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Account
                          </Link>
                        </SheetClose>
                      </motion.div>
                    </div>
                  </motion.div>
                    )}
                  </AnimatePresence>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
