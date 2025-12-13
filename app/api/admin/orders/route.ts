import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { verifyAuth } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const dateFilter = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query: any = {};

    // Filter by specific date (today)
    if (dateFilter) {
      const date = new Date(dateFilter);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

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
    const products = await Product.find({ _id: { $in: Array.from(productIds) } })
      .select("images")
      .lean();

    // 3. Create a map of product ID to image
    const productImages = new Map<string, string>();
    products.forEach((product: any) => {
      if (product.images && product.images.length > 0) {
        productImages.set(product._id.toString(), product.images[0]);
      }
    });

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
