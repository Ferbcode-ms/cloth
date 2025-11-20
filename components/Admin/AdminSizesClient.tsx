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
import { Edit, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Size {
  _id: string;
  name: string;
  value: string;
  order: number;
}

interface AdminSizesClientProps {
  initialSizes: Size[];
}

export default function AdminSizesClient({
  initialSizes,
}: AdminSizesClientProps) {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    order: 0,
  });

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sizes");
      const data = await response.json();
      setSizes(data || []);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.value.trim()) {
      setError("Name and value are required");
      return;
    }

    try {
      const url = editingSize ? `/api/sizes/${editingSize._id}` : "/api/sizes";
      const method = editingSize ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save size");
      }

      setSuccess(
        editingSize ? "Size updated successfully" : "Size created successfully"
      );
      setFormData({ name: "", value: "", order: 0 });
      setShowForm(false);
      setEditingSize(null);
      await fetchSizes();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to save size");
    }
  };

  const handleEdit = (size: Size) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      value: size.value,
      order: size.order || 0,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return;

    try {
      const response = await fetch(`/api/sizes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete size");
      }

      // Orders are automatically normalized by the API after deletion
      await fetchSizes();
      setSuccess("Size deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      toast.success("Size deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete size");
    }
  };

  const handleOrderChange = async (id: string, direction: "up" | "down") => {
    const size = sizes.find((s) => s._id === id);
    if (!size) return;

    const currentIndex = sizes.findIndex((s) => s._id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sizes.length - 1)
    ) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetSize = sizes[targetIndex];

    // Swap orders
    const newOrder = targetSize.order;
    const oldOrder = size.order;

    try {
      await Promise.all([
        fetch(`/api/sizes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newOrder }),
        }),
        fetch(`/api/sizes/${targetSize._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: oldOrder }),
        }),
      ]);

      await fetchSizes();
      toast.success("Order updated successfully");
    } catch (error: any) {
      toast.error("Failed to update order");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSize(null);
    setFormData({ name: "", value: "", order: 0 });
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-foreground">Sizes</h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingSize(null);
            // Calculate next order value: max order + 1, or 0 if no sizes
            const maxOrder =
              sizes.length > 0
                ? Math.max(...sizes.map((s) => s.order || 0))
                : -1;
            setFormData({ name: "", value: "", order: maxOrder + 1 });
            setError(null);
            setSuccess(null);
          }}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Size
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
            <CardTitle>{editingSize ? "Edit Size" : "Add New Size"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel>Size Name *</FieldLabel>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Small, Medium, Large"
                  required
                />
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Value *</FieldLabel>
                <Input
                  type="text"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="e.g., S, M, L (for filtering)"
                  required
                />
                <FieldError />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for filtering products. Should match product variant
                  sizes.
                </p>
              </FieldGroup>

              <div className="flex gap-2">
                <Button type="submit" size="lg">
                  {editingSize ? "Update Size" : "Create Size"}
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
                  <TableHead>Value</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        No sizes found. Create your first size!
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sizes.map((size, index) => (
                    <TableRow key={size._id}>
                      <TableCell className="font-medium">{size.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {size.value}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{size.order}</span>
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => handleOrderChange(size._id, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() =>
                                handleOrderChange(size._id, "down")
                              }
                              disabled={index === sizes.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(size)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(size._id)}
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
