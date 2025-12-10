import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Slider from "@/lib/models/Slider";
import { verifyAuth } from "@/lib/utils/auth";

export async function GET() {
  await connectDB();
  const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
  return NextResponse.json(sliders);
}

export async function POST(req: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const slider = await Slider.create(body);
    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
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

    await connectDB();
    const body = await req.json();
    const { _id, ...updateData } = body;
    
    const slider = await Slider.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json(slider);
  } catch (error) {
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

    await connectDB();
    const slider = await Slider.findByIdAndDelete(id);

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Slider deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete slider" },
      { status: 500 }
    );
  }
}
