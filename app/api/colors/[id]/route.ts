import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Color from "@/lib/models/Color";
import { verifyAuth } from "@/lib/utils/auth";

// GET single color
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const color = await Color.findById(id).lean();

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

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name, value, hex } = body;

    const color = await Color.findById(id);
    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    if (name) color.name = name;
    if (value) color.value = value;
    if (hex) color.hex = hex;

    // Check if another color with same name or value exists
    if (name || value) {
      const query: any = { _id: { $ne: id } };
      if (name) query.name = name;
      if (value) query.value = value;

      const existing = await Color.findOne(query);

      if (existing) {
        return NextResponse.json(
          { error: "Color with this name or value already exists" },
          { status: 400 }
        );
      }
    }

    await color.save();
    return NextResponse.json(color);
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

    await connectDB();
    const { id } = await params;

    const color = await Color.findByIdAndDelete(id);
    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Color deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting color:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete color" },
      { status: 500 }
    );
  }
}
