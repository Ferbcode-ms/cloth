import { Suspense } from "react";
import AdminSlidersClient from "@/components/Admin/AdminSlidersClient";
import connectDB from "@/lib/db";
import Slider from "@/lib/models/Slider";

export const dynamic = "force-dynamic";

async function getSliders() {
  await connectDB();
  const sliders = await Slider.find().sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(sliders));
}

export default async function AdminSlidersPage() {
  const sliders = await getSliders();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSlidersClient initialSliders={sliders} />
    </Suspense>
  );
}
