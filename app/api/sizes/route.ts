import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Size from "@/lib/models/Size";
import { verifyAuth } from "@/lib/utils/auth";

// GET all sizes
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const sizes = await Size.find().sort({ order: 1, name: 1 }).lean();
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

    await connectDB();
    const body = await request.json();
    const { name, value, order } = body;

    if (!name || !value) {
      return NextResponse.json(
        { error: "Name and value are required" },
        { status: 400 }
      );
    }

    // Check if size with same name or value exists
    const existing = await Size.findOne({
      $or: [{ name }, { value }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Size with this name or value already exists" },
        { status: 400 }
      );
    }

    const size = new Size({
      name,
      value,
      order: order || 0,
    });

    await size.save();
    return NextResponse.json(size, { status: 201 });
  } catch (error: any) {
    console.error("Error creating size:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create size" },
      { status: 500 }
    );
  }
}

