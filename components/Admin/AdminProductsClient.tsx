"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import ProductForm from "./ProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Trash2, Search } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  variants: Array<{
    color: string;
    sizes: Array<{ size: string; stock: number }>;
  }>;
}

interface AdminProductsClientProps {
  initialProducts: Product[];
}

export default function AdminProductsClient({
  initialProducts,
}: AdminProductsClientProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(
    searchParams.get("action") === "add"
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      await fetchProducts();
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const calculateTotalStock = (product: Product): number => {
    return product.variants.reduce((total, variant) => {
      return (
        total +
        variant.sizes.reduce((variantTotal, size) => {
          return variantTotal + (size.stock || 0);
        }, 0)
      );
    }, 0);
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map((p) => p._id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Handle individual checkbox
  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Check if all filtered products are selected
  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProducts.has(p._id));

  // Check if some (but not all) are selected
  const someSelected =
    filteredProducts.some((p) => selectedProducts.has(p._id)) && !allSelected;

  // Bulk delete selected products
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.size} product(s)?`
      )
    )
      return;

    try {
      const deletePromises = Array.from(selectedProducts).map((id) =>
        fetch(`/api/products/${id}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);
      setSelectedProducts(new Set());
      await fetchProducts();
      toast.success("Products deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete products");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl md:text-4xl font-bold text-textPrimary">
          Products
        </h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          size="lg"
          className="w-full md:w-auto"
        >
          + Add Product
        </Button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {loading ? (
        <p className="text-sm text-textSecondary">Loading...</p>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 w-full min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              {selectedProducts.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedProducts.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="-mx-2 sm:mx-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <p className="text-sm text-textSecondary">
                          {searchQuery
                            ? "No products found matching your search."
                            : "No products found."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.has(product._id)}
                            onCheckedChange={(checked: boolean) =>
                              handleSelectProduct(product._id, checked)
                            }
                            aria-label={`Select ${product.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          {product.images[0] ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md border border-border bg-muted" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-textPrimary">
                            {product.title}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{product.price}
                        </TableCell>
                        <TableCell className="text-textSecondary">
                          {product.category}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {calculateTotalStock(product)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
