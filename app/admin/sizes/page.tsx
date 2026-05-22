import { Suspense } from "react";
import AdminSizesClient from "@/components/Admin/AdminSizesClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mapSize(s: any) {
  if (!s) return s;
  return {
    ...s,
    _id: s.id,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

async function getSizes() {
  const { data: rawSizes, error } = await supabase
    .from("sizes")
    .select("*")
    .order("order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return JSON.parse(JSON.stringify((rawSizes || []).map(mapSize)));
}

export default async function AdminSizesPage() {
  const sizes = await getSizes();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSizesClient initialSizes={sizes} />
    </Suspense>
  );
}
