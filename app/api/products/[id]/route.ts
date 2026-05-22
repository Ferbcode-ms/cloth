import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";
import { deleteImageFromCloudinary } from "@/lib/utils/cloudinary";

function extractProductHelpers(variants: any[]) {
  if (!variants || !Array.isArray(variants)) {
    return { colors: [], sizes: [], total_stock: 0 };
  }
  const colors = variants.map((v: any) => v.color).filter(Boolean);
  const sizesSet = new Set<string>();
  let totalStock = 0;
  variants.forEach((v: any) => {
    if (v.sizes && Array.isArray(v.sizes)) {
      v.sizes.forEach((s: any) => {
        if (s.size) sizesSet.add(s.size);
        if (s.stock !== undefined) totalStock += Number(s.stock) || 0;
      });
    }
  });
  return {
    colors: Array.from(new Set(colors)),
    sizes: Array.from(sizesSet),
    total_stock: totalStock,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      subcategory,
      images,
      variants,
      discount,
      discountType,
    } = body;

    const { data: product, error: getError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    updateData.subcategory = subcategory || null;
    if (images !== undefined) updateData.images = images;
    if (variants !== undefined) {
      updateData.variants = variants;
      const helpers = extractProductHelpers(variants);
      updateData.colors = helpers.colors;
      updateData.sizes = helpers.sizes;
      updateData.total_stock = helpers.total_stock;
    }
    if (discount !== undefined) updateData.discount = discount;
    if (discountType !== undefined) updateData.discount_type = discountType;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ product: updatedProduct });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: product, error: getError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl: string) =>
        deleteImageFromCloudinary(imageUrl)
      );
      await Promise.all(deletePromises);
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
