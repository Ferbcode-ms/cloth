import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Color from "@/lib/models/Color";
import { verifyAuth } from "@/lib/utils/auth";

// GET all colors
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const colors = await Color.find().sort({ name: 1 }).lean();
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

    await connectDB();
    const body = await request.json();
    const { name, value, hex } = body;

    if (!name || !value || !hex) {
      return NextResponse.json(
        { error: "Name, value, and hex are required" },
        { status: 400 }
      );
    }

    // Check if color with same name or value exists
    const existing = await Color.findOne({
      $or: [{ name }, { value }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Color with this name or value already exists" },
        { status: 400 }
      );
    }

    const color = new Color({
      name,
      value,
      hex,
    });

    await color.save();
    return NextResponse.json(color, { status: 201 });
  } catch (error: any) {
    console.error("Error creating color:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create color" },
      { status: 500 }
    );
  }
}

