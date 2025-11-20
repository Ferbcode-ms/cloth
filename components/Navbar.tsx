"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<
    { _id: string; name: string; slug: string }[]
  >([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".shop-dropdown")) {
        setIsShopDropdownOpen(false);
      }
    };

    if (isShopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShopDropdownOpen]);

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

  // Load categories for Shop dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const data = await res.json();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching navbar categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const navLinks = [
    { name: "On Sale", href: "/products?sale=true" },
    { name: "New Arrivals", href: "/products?new=true" },
    { name: "Brands", href: "/products" },
  ];

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-black text-white py-1 px-4 relative overflow-hidden">
        <div className="whitespace-nowrap">
          <div className="inline-block animate-marquee will-change-transform">
            <span className="text-sm inline-block">
              Sign up and get 20% off to your first order.{" "}
              <Link
                href="/products"
                className="underline hover:no-underline transition-all"
              >
                Sign Up Now
              </Link>
              {" • "}
              Sign up and get 20% off to your first order.{" "}
              <Link
                href="/products"
                className="underline hover:no-underline transition-all"
              >
                Sign Up Now
              </Link>
              {" • "}
            </span>
            <span className="text-sm inline-block ml-8">
              Sign up and get 20% off to your first order.{" "}
              <Link
                href="/products"
                className="underline hover:no-underline transition-all"
              >
                Sign Up Now
              </Link>
              {" • "}
              Sign up and get 20% off to your first order.{" "}
              <Link
                href="/products"
                className="underline hover:no-underline transition-all"
              >
                Sign Up Now
              </Link>
              {" • "}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="border-b border-border bg-background sticky top-0 z-50 sm:px-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
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
                  onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                  className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 h-auto p-0"
                >
                  Shop
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isShopDropdownOpen && "rotate-180"
                    )}
                  />
                </Button>
                {isShopDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-2 z-50">
                    {categories.length === 0 ? (
                      <span className="block px-4 py-2 text-sm text-muted-foreground">
                        No categories
                      </span>
                    ) : (
                      categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/products?category=${encodeURIComponent(
                            category.name
                          )}`}
                          onClick={() => setIsShopDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Other Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-foreground hover:text-foreground/80 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
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
                  side="left"
                  className="w-[280px] sm:w-[320px] p-0"
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Main navigation menu for SHOP.CO
                  </SheetDescription>
                  <div className="flex flex-col h-full">
                    {/* Header with Logo and Close Button */}
                    <div className="flex items-center justify-center px-6 py-6 border-b border-border relative">
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-bold text-foreground tracking-tight"
                      >
                        SHOP.CO
                      </Link>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="flex flex-col gap-1 px-6 py-6">
                      {/* Shop Dropdown Mobile */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setIsShopDropdownOpen(!isShopDropdownOpen)
                          }
                          className="flex items-center justify-between w-full text-base font-medium text-foreground h-auto p-0 hover:bg-transparent"
                        >
                          Shop
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              isShopDropdownOpen && "rotate-180"
                            )}
                          />
                        </Button>
                        {isShopDropdownOpen && (
                          <div className="mt-2 ml-4 flex flex-col gap-2">
                            {categories.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                No categories
                              </span>
                            ) : (
                              categories.map((category) => (
                                <SheetClose asChild key={category._id}>
                                  <Link
                                    href={`/products?category=${encodeURIComponent(
                                      category.name
                                    )}`}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {category.name}
                                  </Link>
                                </SheetClose>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Other Mobile Links */}
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.name}>
                          <Link
                            href={link.href}
                            className="text-base font-medium text-foreground hover:text-foreground/80 transition-colors py-2"
                          >
                            {link.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
