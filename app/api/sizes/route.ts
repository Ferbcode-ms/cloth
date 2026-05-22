import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

// GET all sizes
export async function GET(request: NextRequest) {
  try {
    const { data: sizes, error } = await supabase
      .from("sizes")
      .select("*")
      .order("order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json(sizes);
  } catch (error: any) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch sizes" },
      { status: 500 }
    );
  }
}

// POST create new size
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, value, order } = body;

    if (!name || !value) {
      return NextResponse.json(
        { error: "Name and value are required" },
        { status: 400 }
      );
    }

    // Check if size with same name or value exists
    const { data: existing, error: findError } = await supabase
      .from("sizes")
      .select("id")
      .or(`name.eq."${name}",value.eq."${value}"`)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return NextResponse.json(
        { error: "Size with this name or value already exists" },
        { status: 400 }
      );
    }

    const { data: size, error: insertError } = await supabase
      .from("sizes")
      .insert({
        name,
        value,
        order: order || 0,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(size, { status: 201 });
  } catch (error: any) {
    console.error("Error creating size:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create size" },
      { status: 500 }
    );
  }
}
