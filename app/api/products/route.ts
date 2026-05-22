import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";
import { calculateProductPrice } from "@/lib/utils/price";

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

function mapProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    _id: p.id,
    discountType: p.discount_type,
    orderCount: p.order_count,
    totalStock: p.total_stock,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function mapCategory(c: any) {
  if (!c) return c;
  return {
    ...c,
    _id: c.id,
    discountType: c.discount_type,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const stockStatus = searchParams.get("stockStatus");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    let query = supabase.from("products").select("*", { count: "exact" });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (stockStatus) {
      if (stockStatus === "out_of_stock") {
        query = query.eq("total_stock", 0);
      } else if (stockStatus === "low_stock") {
        query = query.gt("total_stock", 0).lt("total_stock", 10);
      } else if (stockStatus === "in_stock") {
        query = query.gte("total_stock", 10);
      }
    }

    const { data: rawProducts, count, error } = await query
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    const total = count || 0;
    const products = (rawProducts || []).map(mapProduct);

    // Fetch categories for discount calculation
    const { data: rawCategories } = await supabase
      .from("categories")
      .select("name, discount, discount_type");

    const categories = (rawCategories || []).map(mapCategory);
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const productsWithDiscounts = products.map((product: any) => {
      return calculateProductPrice(product, categoryMap);
    });

    return NextResponse.json({
      products: productsWithDiscounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Validate required fields
    if (!title || !description || price === undefined || !category) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, price, or category",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.color) {
        return NextResponse.json(
          { error: `Variant ${i + 1} is missing color` },
          { status: 400 }
        );
      }
      if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
        return NextResponse.json(
          { error: `Variant ${i + 1} must have at least one size` },
          { status: 400 }
        );
      }
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const helpers = extractProductHelpers(variants);

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        title,
        description,
        price,
        category,
        subcategory: subcategory || null,
        images,
        variants,
        slug,
        discount: discount || 0,
        discount_type: discountType || "percentage",
        colors: helpers.colors,
        sizes: helpers.sizes,
        total_stock: helpers.total_stock,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Product with this title already exists" },
          { status: 400 }
        );
      }
      throw insertError;
    }

    return NextResponse.json(
      { product: mapProduct(newProduct) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
