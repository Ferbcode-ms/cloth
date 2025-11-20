"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Edit, Trash2, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
}

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

export default function AdminCategoriesClient({
  initialCategories,
}: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    subcategories: [] as Array<{ name: string; slug: string }>,
  });

  const [newSubcategory, setNewSubcategory] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) {
      setError("Subcategory name cannot be empty");
      return;
    }

    // Check for duplicate subcategory names
    const isDuplicate = formData.subcategories.some(
      (sub) => sub.name.toLowerCase() === newSubcategory.trim().toLowerCase()
    );

    if (isDuplicate) {
      setError("Subcategory with this name already exists");
      return;
    }

    const slug = newSubcategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData({
      ...formData,
      subcategories: [
        ...formData.subcategories,
        { name: newSubcategory.trim(), slug },
      ],
    });
    setNewSubcategory("");
    setError(null);
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      setSuccess(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );
      setFormData({ name: "", image: "", subcategories: [] });
      setShowForm(false);
      setEditingCategory(null);
      await fetchCategories();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image || "",
      subcategories: category.subcategories || [],
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      await fetchCategories();
      setSuccess("Category deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", image: "", subcategories: [] });
    setNewSubcategory("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-5 sm:gap-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Categories
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: "", image: "", subcategories: [] });
            setError(null);
            setSuccess(null);
          }}
          size="lg"
          className="w-full p-2 sm:w-auto sm:p-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel>Category Name *</FieldLabel>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., T-shirts, Jeans, Shoes"
                  required
                />
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Category Image URL (Optional)</FieldLabel>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL for the category image. If left empty, a default
                  placeholder will be used on the homepage.
                </p>
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Subcategories</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => {
                      setNewSubcategory(e.target.value);
                      setError(null); // Clear error when typing
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    placeholder="Add subcategory name"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSubcategory}
                    variant="outline"
                    disabled={!newSubcategory.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.subcategories.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {formData.subcategories.length} subcategor
                      {formData.subcategories.length === 1 ? "y" : "ies"} added
                    </p>
                    {formData.subcategories.map((sub, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm font-medium">{sub.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSubcategory(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.subcategories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    No subcategories added yet. Add one above.
                  </p>
                )}
              </FieldGroup>

              <div className="flex gap-2">
                <Button type="submit" size="lg">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        No categories found. Create your first category!
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell>
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No image
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {category.subcategories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.map((sub, index) => (
                              <span
                                key={index}
                                className="text-xs bg-muted px-2 py-1 rounded"
                              >
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No subcategories
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category._id)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
