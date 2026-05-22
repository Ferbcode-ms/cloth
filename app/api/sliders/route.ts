import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

export async function GET() {
  try {
    const { data: sliders, error } = await supabase
      .from("sliders")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(sliders);
  } catch (error: any) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json(
      { error: "Failed to fetch sliders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, imageUrl, link, isActive, order } = body;

    const { data: slider, error } = await supabase
      .from("sliders")
      .insert({
        title,
        description,
        image_url: imageUrl,
        link,
        is_active: isActive !== undefined ? isActive : true,
        order: order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(slider, { status: 201 });
  } catch (error: any) {
    console.error("Error creating slider:", error);
    return NextResponse.json(
      { error: "Failed to create slider" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { _id, id, title, description, imageUrl, link, isActive, order } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ error: "Slider ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (link !== undefined) updateData.link = link;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (order !== undefined) updateData.order = order;
    updateData.updated_at = new Date().toISOString();

    const { data: slider, error } = await supabase
      .from("sliders")
      .update(updateData)
      .eq("id", targetId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json(slider);
  } catch (error: any) {
    console.error("Error updating slider:", error);
    return NextResponse.json(
      { error: "Failed to update slider" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Slider ID is required" },
        { status: 400 }
      );
    }

    const { data: slider, error: getError } = await supabase
      .from("sliders")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (getError || !slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("sliders")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Slider deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting slider:", error);
    return NextResponse.json(
      { error: "Failed to delete slider" },
      { status: 500 }
    );
  }
}
