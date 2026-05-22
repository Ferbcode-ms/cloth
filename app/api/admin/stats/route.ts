import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalOrdersRes, pendingOrdersRes, totalProductsRes] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "Pending"),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ]);

    if (totalOrdersRes.error) throw totalOrdersRes.error;
    if (pendingOrdersRes.error) throw pendingOrdersRes.error;
    if (totalProductsRes.error) throw totalProductsRes.error;

    return NextResponse.json({
      totalOrders: totalOrdersRes.count || 0,
      pendingOrders: pendingOrdersRes.count || 0,
      totalProducts: totalProductsRes.count || 0,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
