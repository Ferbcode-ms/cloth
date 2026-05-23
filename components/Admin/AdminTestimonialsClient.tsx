"use client";

import { useState } from "react";
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
import { Edit, Trash2, Plus, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface Testimonial {
  _id: string;
  name: string;
  rating: number;
  text: string;
  created_at?: string;
}

interface AdminTestimonialsClientProps {
  initialTestimonials: Testimonial[];
}

export default function AdminTestimonialsClient({
  initialTestimonials,
}: AdminTestimonialsClientProps) {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(initialTestimonials);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    text: "",
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/testimonials");
      const data = await response.json();
      const mapped = (data || []).map((t: any) => ({
        ...t,
        _id: t.id,
      }));
      setTestimonials(mapped);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!formData.text.trim()) {
      setError("Review text is required");
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }

    try {
      const method = editingTestimonial ? "PUT" : "POST";

      const body = editingTestimonial
        ? { ...formData, _id: editingTestimonial._id }
        : formData;

      const response = await fetch("/api/testimonials", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save testimonial");
      }

      const msg = editingTestimonial
        ? "Testimonial updated successfully"
        : "Testimonial created successfully";
      setSuccess(msg);
      toast.success(msg);

      // Reset form
      setFormData({
        name: "",
        rating: 5,
        text: "",
      });
      setShowForm(false);
      setEditingTestimonial(null);
      await fetchTestimonials();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      rating: testimonial.rating,
      text: testimonial.text,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete testimonial");
      }

      await fetchTestimonials();
      setSuccess("Testimonial deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      toast.success("Testimonial deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete testimonial");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    setFormData({
      name: "",
      rating: 5,
      text: "",
    });
    setError(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-300 text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-5 sm:gap-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Testimonials
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingTestimonial(null);
            setFormData({
              name: "",
              rating: 5,
              text: "",
            });
            setError(null);
            setSuccess(null);
          }}
          size="lg"
          className="w-full p-2 sm:w-auto sm:p-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
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
              {editingTestimonial
                ? "Edit Testimonial"
                : "Add New Testimonial"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel>Customer Name *</FieldLabel>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., John D."
                  maxLength={60}
                  required
                />
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Rating (1-5) *</FieldLabel>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-24"
                    required
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 cursor-pointer transition-colors ${
                          i < formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, rating: i + 1 })
                        }
                      />
                    ))}
                  </div>
                </div>
                <FieldError />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Review Text *</FieldLabel>
                <Textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="Write the customer's review here..."
                  maxLength={500}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.text.length}/500 characters
                </p>
                <FieldError />
              </FieldGroup>

              <div className="flex gap-2">
                <Button type="submit" size="lg">
                  {editingTestimonial
                    ? "Update Testimonial"
                    : "Create Testimonial"}
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        No testimonials found. Add your first testimonial!
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  testimonials.map((testimonial) => (
                    <TableRow key={testimonial._id}>
                      <TableCell className="font-medium">
                        {testimonial.name}
                      </TableCell>
                      <TableCell>{renderStars(testimonial.rating)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {testimonial.text}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(testimonial._id)}
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
