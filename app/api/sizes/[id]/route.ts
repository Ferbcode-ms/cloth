import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Size from "@/lib/models/Size";
import { verifyAuth } from "@/lib/utils/auth";

// GET single size
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const size = await Size.findById(id).lean();

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

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name, value, order } = body;

    const size = await Size.findById(id);
    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    if (name) size.name = name;
    if (value) size.value = value;
    if (order !== undefined) size.order = order;

    // Check if another size with same name or value exists
    if (name || value) {
      const query: any = { _id: { $ne: id } };
      if (name) query.name = name;
      if (value) query.value = value;

      const existing = await Size.findOne(query);

      if (existing) {
        return NextResponse.json(
          { error: "Size with this name or value already exists" },
          { status: 400 }
        );
      }
    }

    await size.save();
    return NextResponse.json(size);
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

    await connectDB();
    const { id } = await params;

    const size = await Size.findByIdAndDelete(id);
    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    // Re-normalize all order values to be sequential (0, 1, 2, 3...)
    const allSizes = await Size.find().sort({ order: 1, name: 1 });
    for (let i = 0; i < allSizes.length; i++) {
      if (allSizes[i].order !== i) {
        allSizes[i].order = i;
        await allSizes[i].save();
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
