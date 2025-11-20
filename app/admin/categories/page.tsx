import { Suspense } from "react";
import AdminCategoriesClient from "@/components/Admin/AdminCategoriesClient";
import connectDB from "@/lib/db";
import Category from "@/lib/models/Category";

export const dynamic = "force-dynamic";

async function getCategories() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminCategoriesClient initialCategories={categories} />
    </Suspense>
  );
}
