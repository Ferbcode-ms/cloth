import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

// GET single color
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: color, error } = await supabase
      .from("colors")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json(color);
  } catch (error: any) {
    console.error("Error fetching color:", error);
    return NextResponse.json(
      { error: "Failed to fetch color" },
      { status: 500 }
    );
  }
}

// PUT update color
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
    const { name, value, hex } = body;

    const { data: color, error: getError } = await supabase
      .from("colors")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError || !color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (value) updateData.value = value;
    if (hex) updateData.hex = hex;

    // Check if another color with same name or value exists
    if (name || value) {
      let query = supabase.from("colors").select("id").neq("id", id);
      if (name && value) {
        query = query.or(`name.eq."${name}",value.eq."${value}"`);
      } else if (name) {
        query = query.eq("name", name);
      } else if (value) {
        query = query.eq("value", value);
      }

      const { data: existing, error: findError } = await query.maybeSingle();
      if (findError) throw findError;

      if (existing) {
        return NextResponse.json(
          { error: "Color with this name or value already exists" },
          { status: 400 }
        );
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedColor, error: updateError } = await supabase
      .from("colors")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedColor);
  } catch (error: any) {
    console.error("Error updating color:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update color" },
      { status: 500 }
    );
  }
}

// DELETE color
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

    const { data: color, error: getError } = await supabase
      .from("colors")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (getError || !color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("colors")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Color deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting color:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete color" },
      { status: 500 }
    );
  }
}
