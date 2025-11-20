import { Suspense } from "react";
import AdminSizesClient from "@/components/Admin/AdminSizesClient";
import connectDB from "@/lib/db";
import Size from "@/lib/models/Size";

export const dynamic = "force-dynamic";

async function getSizes() {
  await connectDB();
  const sizes = await Size.find().sort({ order: 1, name: 1 }).lean();
  return JSON.parse(JSON.stringify(sizes));
}

export default async function AdminSizesPage() {
  const sizes = await getSizes();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSizesClient initialSizes={sizes} />
    </Suspense>
  );
}

