import { Suspense } from "react";
import AdminColorsClient from "@/components/Admin/AdminColorsClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mapColor(c: any) {
  if (!c) return c;
  return {
    ...c,
    _id: c.id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

async function getColors() {
  const { data: rawColors, error } = await supabase
    .from("colors")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return JSON.parse(JSON.stringify((rawColors || []).map(mapColor)));
}

export default async function AdminColorsPage() {
  const colors = await getColors();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminColorsClient initialColors={colors} />
    </Suspense>
  );
}
