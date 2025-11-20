"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
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

interface Color {
  _id: string;
  name: string;
  value: string;
  hex: string;
}

interface AdminColorsClientProps {
  initialColors: Color[];
}

export default function AdminColorsClient({
  initialColors,
}: AdminColorsClientProps) {
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    hex: "#000000",
  });

  const fetchColors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/colors");
      const data = await response.json();
      setColors(data || []);
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !formData.name.trim() ||
      !formData.value.trim() ||
      !formData.hex.trim()
    ) {
      setError("All fields are required");
      return;
    }

    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(formData.hex)) {
      setError("Invalid hex color code. Use format #RRGGBB or #RGB");
      return;
    }

    try {
      const url = editingColor
        ? `/api/colors/${editingColor._id}`
        : "/api/colors";
      const method = editingColor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save color");
      }

      setSuccess(
        editingColor
          ? "Color updated successfully"
          : "Color created successfully"
      );
      setFormData({ name: "", value: "", hex: "#000000" });
      setShowForm(false);
      setEditingColor(null);
      await fetchColors();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to save color");
    }
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      value: color.value,
      hex: color.hex,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;

    try {
      const response = await fetch(`/api/colors/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete color");
      }

      await fetchColors();
      setSuccess("Color deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      toast.success("Color deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete color");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingColor(null);
    setFormData({ name: "", value: "", hex: "#000000" });
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-foreground">Colors</h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingColor(null);
            setFormData({ name: "", value: "", hex: "#000000" });
            setError(null);
            setSuccess(null);
          }}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Color
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
              {editingColor ? "Edit Color" : "Add New Color"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel>Color Name *</FieldLabel>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Green, Red, Blue"
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
                    setFormData({
                      ...formData,
                      value: e.target.value.toLowerCase(),
                    })
                  }
                  placeholder="e.g., green, red, blue (for filtering)"
                  required
                />
                <FieldError />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for filtering products. Use lowercase, no spaces (e.g.,
                  "light-blue")
                </p>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Hex Color Code *</FieldLabel>
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                    placeholder="#22c55e"
                    required
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={formData.hex}
                    onChange={(e) =>
                      setFormData({ ...formData, hex: e.target.value })
                    }
                    className="w-12 h-12 rounded border border-border cursor-pointer"
                  />
                  <div
                    className="w-12 h-12 rounded border border-border"
                    style={{ backgroundColor: formData.hex }}
                  />
                </div>
                <FieldError />
                <p className="text-xs text-muted-foreground mt-1">
                  Hex color code (e.g., #22c55e for green)
                </p>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Common Colors</FieldLabel>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Click a color to auto-fill name, value, and hex code
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Black", hex: "#000000" },
                      { name: "White", hex: "#FFFFFF" },
                      { name: "Red", hex: "#FF0000" },
                      { name: "Blue", hex: "#0000FF" },
                      { name: "Green", hex: "#00FF00" },
                      { name: "Yellow", hex: "#FFFF00" },
                      { name: "Orange", hex: "#FFA500" },
                      { name: "Purple", hex: "#800080" },
                      { name: "Pink", hex: "#FFC0CB" },
                      { name: "Brown", hex: "#A52A2A" },
                      { name: "Gray", hex: "#808080" },
                      { name: "Navy", hex: "#000080" },
                    ].map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            hex: color.hex,
                            name: color.name,
                            value: color.name.toLowerCase(),
                          })
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-md border text-xs font-medium transition-all hover:scale-105",
                          formData.hex.toUpperCase() === color.hex.toUpperCase()
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </FieldGroup>

              <div className="flex gap-2">
                <Button type="submit" size="lg">
                  {editingColor ? "Update Color" : "Create Color"}
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
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        No colors found. Create your first color!
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  colors.map((color) => (
                    <TableRow key={color._id}>
                      <TableCell className="font-medium">
                        {color.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {color.value}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border border-border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {color.hex}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(color)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(color._id)}
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
