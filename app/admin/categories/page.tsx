import { Suspense } from "react";
import AdminCategoriesClient from "@/components/Admin/AdminCategoriesClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mapCategory(c: any) {
  if (!c) return c;
  return {
    ...c,
    _id: c.id,
    discountType: c.discount_type,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

async function getCategories() {
  const { data: rawCategories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return JSON.parse(JSON.stringify((rawCategories || []).map(mapCategory)));
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminCategoriesClient initialCategories={categories} />
    </Suspense>
  );
}
