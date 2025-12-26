"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    subcategory: "",
    images: [] as string[],
    variants: [] as Array<{
      color: string;
      sizes: Array<{ size: string; stock: number }>;
    }>,
    discount: 0,
    discountType: "percentage" as "percentage" | "fixed",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const addingSizeRef = useRef<{
    variantIndex: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    // Fetch categories, colors, and sizes
    const fetchData = async () => {
      try {
        const [categoriesRes, colorsRes, sizesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/colors"),
          fetch("/api/sizes"),
        ]);

        const [categoriesData, colorsData, sizesData] = await Promise.all([
          categoriesRes.json(),
          colorsRes.json(),
          sizesRes.json(),
        ]);

        setCategories(categoriesData || []);
        setColors(colorsData || []);
        // Add "One Size" option manually so it's always available
        const fetchedSizes = sizesData || [];
        const hasOneSize = fetchedSizes.some((s: any) => s.value === "One Size" || s.name === "One Size");
        
        if (!hasOneSize) {
          fetchedSizes.unshift({ _id: "one-size-manual", name: "One Size", value: "One Size" });
        }
        
        setSizes(fetchedSizes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "",
        subcategory: product.subcategory || "",
        images: product.images || [],
        variants: product.variants || [],
        discount: product.discount || 0,
        discountType: product.discountType || "percentage",
      });
      // Find and set selected category
      if (product.category) {
        const cat = categories.find(
          (c) => c.name === product.category || c._id === product.category
        );
        if (cat) setSelectedCategory(cat);
      }
    }
  }, [product, categories]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      // Get signed upload URL
      const uploadResponse = await fetch("/api/products/upload");
      if (!uploadResponse.ok) throw new Error("Failed to get upload URL");
      const { signature, timestamp, cloudName, apiKey } =
        await uploadResponse.json();

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "clothing-ecommerce");

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) throw new Error("Upload failed");
      const data = await cloudinaryResponse.json();

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.secure_url],
      }));
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          sizes: [{ size: "S", stock: 0 }],
        },
      ],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleAddSize = (variantIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent double execution (React StrictMode or double clicks)
    const now = Date.now();
    if (
      addingSizeRef.current &&
      addingSizeRef.current.variantIndex === variantIndex &&
      now - addingSizeRef.current.timestamp < 500
    ) {
      return;
    }

    addingSizeRef.current = { variantIndex, timestamp: now };

    setFormData((prev) => {
      const newVariants = prev.variants.map((variant, idx) => {
        if (idx === variantIndex) {
          return {
            ...variant,
            sizes: [...variant.sizes, { size: "S", stock: 0 }],
          };
        }
        return variant;
      });
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveSize = (variantIndex: number, sizeIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter(
        (_, i) => i !== sizeIndex
      );
      return { ...prev, variants: newVariants };
    });
  };

  const handleSizeChange = (
    variantIndex: number,
    sizeIndex: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].sizes[sizeIndex] = {
        ...newVariants[variantIndex].sizes[sizeIndex],
        [field]: value,
      };
      return { ...prev, variants: newVariants };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate character limits
    if (formData.title.length > 100) {
      setError("Title must be 100 characters or less");
      setLoading(false);
      return;
    }

    if (formData.description.length > 2000) {
      setError("Description must be 2000 characters or less");
      setLoading(false);
      return;
    }

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-4xl font-serif font-light text-textPrimary">
              {product ? "Edit Product" : "Add Product"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title *</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <p
                  className={cn(
                    "text-xs mt-1",
                    formData.title.length > 90
                      ? "text-destructive"
                      : formData.title.length > 80
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  )}
                >
                  {formData.title.length}/100 characters
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description *</FieldLabel>
                <textarea
                  id="description"
                  required
                  maxLength={2000}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  )}
                />
                <p
                  className={cn(
                    "text-xs mt-1",
                    formData.description.length > 1900
                      ? "text-destructive"
                      : formData.description.length > 1800
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  )}
                >
                  {formData.description.length}/2000 characters
                </p>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="price">Price *</FieldLabel>
                  <Input
                    id="price"
                    type="text"
                    required
                    value={
                      formData.price === undefined || isNaN(formData.price)
                        ? ""
                        : formData.price.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits and a decimal point
                      const numericValue = value.replace(/[^0-9.]/g, "");
                      const numValue =
                        numericValue === "" ? 0 : parseFloat(numericValue);
                      setFormData({
                        ...formData,
                        price: isNaN(numValue) ? 0 : numValue,
                      });
                    }}
                    onKeyDown={(e) => {
                      // Prevent non-numeric keys except backspace, delete, tab, arrow keys and decimal point
                      if (
                        !/[0-9.]/.test(e.key) &&
                        ![
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "ArrowUp",
                          "ArrowDown",
                        ].includes(e.key) &&
                        !(e.ctrlKey || e.metaKey) // Allow Ctrl/Cmd combinations
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="discount">Discount</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="text"
                      value={
                        formData.discount === undefined || isNaN(formData.discount)
                          ? ""
                          : formData.discount.toString()
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and a decimal point
                        const numericValue = value.replace(/[^0-9.]/g, "");
                        const numValue =
                          numericValue === "" ? 0 : parseFloat(numericValue);
                        setFormData({
                          ...formData,
                          discount: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, tab, arrow keys and decimal point
                        if (
                          !/[0-9.]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "Tab",
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(e.key) &&
                          !(e.ctrlKey || e.metaKey)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="flex-1"
                    />
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, discountType: value as "percentage" | "fixed" })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="category">Category *</FieldLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const cat = categories.find(
                        (c) => c.name === value || c._id === value
                      );
                      setSelectedCategory(cat || null);
                      setFormData({
                        ...formData,
                        category: value,
                        subcategory: "", // Reset subcategory when category changes
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="subcategory">Subcategory</FieldLabel>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subcategory: value })
                    }
                    disabled={
                      !selectedCategory ||
                      selectedCategory.subcategories.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.subcategories?.map((sub: any) => (
                        <SelectItem key={sub.slug} value={sub.slug}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="images">Images *</FieldLabel>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {uploading && (
                      <Loader2 className="h-4 w-4 animate-spin text-textSecondary" />
                    )}
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Image ${index + 1}`}
                            width={100}
                            height={100}
                            className="object-cover rounded-md border border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              <Field>
                <FieldLabel>Variants *</FieldLabel>
                <div className="space-y-4">
                  {formData.variants.map((variant, variantIndex) => (
                    <Card key={variantIndex}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            Variant {variantIndex + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVariant(variantIndex)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Field>
                          <FieldLabel htmlFor={`variant-color-${variantIndex}`}>
                            Color *
                          </FieldLabel>
                          <Select
                            value={variant.color}
                            onValueChange={(value) =>
                              handleVariantChange(variantIndex, "color", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color._id} value={color.value}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded border border-border"
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    {color.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel>Sizes *</FieldLabel>
                          <div className="space-y-2">
                            {variant.sizes.map((size, sizeIndex) => (
                              <div
                                key={sizeIndex}
                                className="flex gap-2 items-center"
                              >
                                <Select
                                  value={size.size}
                                  onValueChange={(value) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      "size",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sizes.map((s) => (
                                      <SelectItem key={s._id} value={s.value}>
                                        {s.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="text"
                                  placeholder="Stock"
                                  required
                                  value={
                                    size.stock === undefined ||
                                    isNaN(size.stock)
                                      ? ""
                                      : size.stock.toString()
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Only allow numeric input
                                    const numericValue = value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    const intValue =
                                      numericValue === ""
                                        ? 0
                                        : parseInt(numericValue);
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      "stock",
                                      isNaN(intValue) ? 0 : intValue
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    // Prevent non-numeric keys except backspace, delete, tab, arrow keys
                                    if (
                                      !/[0-9]/.test(e.key) &&
                                      ![
                                        "Backspace",
                                        "Delete",
                                        "Tab",
                                        "ArrowLeft",
                                        "ArrowRight",
                                        "ArrowUp",
                                        "ArrowDown",
                                      ].includes(e.key) &&
                                      !(e.ctrlKey || e.metaKey) // Allow Ctrl/Cmd combinations
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  className="w-24"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveSize(variantIndex, sizeIndex)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddSize(variantIndex, e);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Size
                            </Button>
                          </div>
                        </Field>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddVariant}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
              </Field>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
