import { Suspense } from "react";
import AdminSlidersClient from "@/components/Admin/AdminSlidersClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mapSlider(s: any) {
  if (!s) return s;
  return {
    ...s,
    _id: s.id,
    imageUrl: s.image_url,
    isActive: s.is_active,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

async function getSliders() {
  const { data: rawSliders, error } = await supabase
    .from("sliders")
    .select("*")
    .order("order", { ascending: true });

  if (error) throw error;
  return JSON.parse(JSON.stringify((rawSliders || []).map(mapSlider)));
}

export default async function AdminSlidersPage() {
  const sliders = await getSliders();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSlidersClient initialSliders={sliders} />
    </Suspense>
  );
}
