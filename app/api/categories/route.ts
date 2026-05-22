import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, subcategories, image, discount, discountType } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if category with same name or slug exists
    const { data: existing, error: findError } = await supabase
      .from("categories")
      .select("*")
      .or(`name.eq."${name}",slug.eq."${slug}"`)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Ensure all subcategories have slugs
    const processedSubcategories = (subcategories || []).map((sub: any) => {
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

    const { data: category, error: insertError } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        image: image || null,
        subcategories: processedSubcategories,
        discount: discount || 0,
        discount_type: discountType || "percentage",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
