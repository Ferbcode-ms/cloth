import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

// GET single size
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: size, error } = await supabase
      .from("sizes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error: any) {
    console.error("Error fetching size:", error);
    return NextResponse.json(
      { error: "Failed to fetch size" },
      { status: 500 }
    );
  }
}

// PUT update size
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
    const { name, value, order } = body;

    const { data: size, error: getError } = await supabase
      .from("sizes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError || !size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (value) updateData.value = value;
    if (order !== undefined) updateData.order = order;

    // Check if another size with same name or value exists
    if (name || value) {
      let query = supabase.from("sizes").select("id").neq("id", id);
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
          { error: "Size with this name or value already exists" },
          { status: 400 }
        );
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedSize, error: updateError } = await supabase
      .from("sizes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedSize);
  } catch (error: any) {
    console.error("Error updating size:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update size" },
      { status: 500 }
    );
  }
}

// DELETE size
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

    const { data: size, error: getError } = await supabase
      .from("sizes")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (getError || !size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("sizes")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Re-normalize all order values to be sequential (0, 1, 2, 3...)
    const { data: allSizes } = await supabase
      .from("sizes")
      .select("*")
      .order("order", { ascending: true })
      .order("name", { ascending: true });

    if (allSizes) {
      for (let i = 0; i < allSizes.length; i++) {
        if (allSizes[i].order !== i) {
          await supabase.from("sizes").update({ order: i }).eq("id", allSizes[i].id);
        }
      }
    }

    return NextResponse.json({ message: "Size deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting size:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete size" },
      { status: 500 }
    );
  }
}
