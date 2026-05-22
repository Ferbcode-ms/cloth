import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyAuth } from "@/lib/utils/auth";

function mapOrder(o: any) {
  if (!o) return o;
  return {
    ...o,
    _id: o.id,
    totalAmount: Number(o.total_amount),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const dateFilter = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dbQuery = supabase.from("orders").select("*", { count: "exact" });

    // Filter by specific date (today)
    if (dateFilter) {
      const date = new Date(dateFilter);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      dbQuery = dbQuery
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      dbQuery = dbQuery
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
    }

    const { data: rawOrders, count, error } = await dbQuery
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    const total = count || 0;
    const orders = (rawOrders || []).map(mapOrder);

    // Populate product images manually
    // 1. Get all product IDs from the orders
    const productIds = new Set<string>();
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.productId) {
          productIds.add(item.productId);
        }
      });
    });

    // 2. Fetch products with these IDs (only images)
    let productImages = new Map<string, string>();
    if (productIds.size > 0) {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, images")
        .in("id", Array.from(productIds));

      if (productsError) throw productsError;

      // 3. Create a map of product ID to image
      products.forEach((product: any) => {
        if (product.images && product.images.length > 0) {
          productImages.set(product.id.toString(), product.images[0]);
        }
      });
    }

    // 4. Attach images to order items
    const ordersWithImages = orders.map((order: any) => {
      return {
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          image: productImages.get(item.productId) || null,
        })),
      };
    });

    return NextResponse.json({
      orders: ordersWithImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
