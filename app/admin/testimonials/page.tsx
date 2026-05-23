import { Suspense } from "react";
import AdminTestimonialsClient from "@/components/Admin/AdminTestimonialsClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mapTestimonial(t: any) {
  if (!t) return t;
  return {
    ...t,
    _id: t.id,
  };
}

async function getTestimonials() {
  const { data: rawTestimonials, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return JSON.parse(
    JSON.stringify((rawTestimonials || []).map(mapTestimonial))
  );
}

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminTestimonialsClient initialTestimonials={testimonials} />
    </Suspense>
  );
}
