"use client";

import { useState } from "react";
import Image from "next/image";
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
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Edit, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface Slider {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  order: number;
}

interface AdminSlidersClientProps {
  initialSliders: Slider[];
}

export default function AdminSlidersClient({
  initialSliders,
}: AdminSlidersClientProps) {
  const [sliders, setSliders] = useState<Slider[]>(initialSliders);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    isActive: true,
    order: 0,
  });

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sliders");
      const data = await response.json();
      setSliders(data || []);
    } catch (error) {
      console.error("Error fetching sliders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.imageUrl.trim()) {
      setError("Image URL is required");
      return;
    }
    if (!formData.link.trim()) {
      setError("Link URL is required");
      return;
    }

    try {
      const url = editingSlider
        ? "/api/sliders"
        : "/api/sliders";
      const method = editingSlider ? "PUT" : "POST";
      
      const body = editingSlider 
        ? { ...formData, _id: editingSlider._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save slider");
      }

      setSuccess(
        editingSlider
          ? "Slider updated successfully"
          : "Slider created successfully"
      );
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        link: "",
        isActive: true,
        order: 0,
      });
      setShowForm(false);
      setEditingSlider(null);
      await fetchSliders();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to save slider");
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description,
      imageUrl: slider.imageUrl,
      link: slider.link,
      isActive: slider.isActive,
      order: slider.order,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;

    try {
      const response = await fetch(`/api/sliders?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete slider");
      }

      await fetchSliders();
      setSuccess("Slider deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      toast.success("Slider deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete slider");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlider(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      isActive: true,
      order: 0,
    });
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-5 sm:gap-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Home Slider
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingSlider(null);
            setFormData({
              title: "",
              description: "",
              imageUrl: "",
              link: "",
              isActive: true,
              order: sliders.length, // Default to end
            });
            setError(null);
            setSuccess(null);
          }}
          size="lg"
          className="w-full p-2 sm:w-auto sm:p-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
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
              {editingSlider ? "Edit Slide" : "Add New Slide"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel>Title *</FieldLabel>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Summer Collection"
                  maxLength={60}
                  required
                />
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Description *</FieldLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., Discover our latest summer arrivals..."
                  maxLength={200}
                  required
                />
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Image URL *</FieldLabel>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md border"
                      onError={(e: any) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Link URL *</FieldLabel>
                <Input
                  type="text"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="e.g., /products/new-arrivals"
                  required
                />
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Order</FieldLabel>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                />
              </FieldGroup>

              <div className="flex gap-2">
                <Button type="submit" size="lg">
                  {editingSlider ? "Update Slide" : "Create Slide"}
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
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        No slides found. Create your first slide!
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sliders.map((slider) => (
                    <TableRow key={slider._id}>
                      <TableCell>
                        <div className="relative w-24 h-12 rounded border overflow-hidden">
                          <Image
                            src={slider.imageUrl}
                            alt={slider.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {slider.title}
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {slider.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {slider.link}
                      </TableCell>
                      <TableCell>{slider.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(slider)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(slider._id)}
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
