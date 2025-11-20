import { Suspense } from "react";
import AdminColorsClient from "@/components/Admin/AdminColorsClient";
import connectDB from "@/lib/db";
import Color from "@/lib/models/Color";

export const dynamic = "force-dynamic";

async function getColors() {
  await connectDB();
  const colors = await Color.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(colors));
}

export default async function AdminColorsPage() {
  const colors = await getColors();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminColorsClient initialColors={colors} />
    </Suspense>
  );
}

