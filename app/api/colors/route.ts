import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

// GET all colors
export async function GET(request: NextRequest) {
  try {
    const { data: colors, error } = await supabase
      .from("colors")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json(colors);
  } catch (error: any) {
    console.error("Error fetching colors:", error);
    return NextResponse.json(
      { error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}

// POST create new color
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, value, hex } = body;

    if (!name || !value || !hex) {
      return NextResponse.json(
        { error: "Name, value, and hex are required" },
        { status: 400 }
      );
    }

    // Check if color with same name or value exists
    const { data: existing, error: findError } = await supabase
      .from("colors")
      .select("id")
      .or(`name.eq."${name}",value.eq."${value}"`)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return NextResponse.json(
        { error: "Color with this name or value already exists" },
        { status: 400 }
      );
    }

    const { data: color, error: insertError } = await supabase
      .from("colors")
      .insert({ name, value, hex })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(color, { status: 201 });
  } catch (error: any) {
    console.error("Error creating color:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create color" },
      { status: 500 }
    );
  }
}
