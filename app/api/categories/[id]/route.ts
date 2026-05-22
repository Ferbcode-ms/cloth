import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT update category
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
    const { name, subcategories, image, discount, discountType } = body;

    // Fetch existing category
    const { data: category, error: getError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if another category with same name or slug exists
      const { data: existing, error: findError } = await supabase
        .from("categories")
        .select("id")
        .neq("id", id)
        .or(`name.eq."${name}",slug.eq."${slug}"`)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 400 }
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (subcategories !== undefined) {
      const processedSubcategories = subcategories.map((sub: any) => {
        if (!sub.slug && sub.name) {
          return {
            name: sub.name,
            slug: sub.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          };
        }
        return sub;
      });
      updateData.subcategories = processedSubcategories;
    }

    if (image !== undefined) {
      updateData.image = image || null;
    }

    if (discount !== undefined) {
      updateData.discount = discount;
    }

    if (discountType !== undefined) {
      updateData.discount_type = discountType;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedCategory, error: updateError } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
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

    // Fetch category name first for product association checking
    const { data: category, error: getError } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    if (getError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if any products are using this category
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .or(`category.eq."${id}",category.eq."${category.name}"`);

    if (countError) throw countError;

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. ${count} product(s) are using it.`,
        },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
