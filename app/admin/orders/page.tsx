import AdminOrdersClient from "@/components/Admin/AdminOrdersClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

async function getOrders() {
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const orders = (rawOrders || []).map(mapOrder);

  // Populate product images
  const productIds = new Set<string>();
  orders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      if (item.productId) {
        productIds.add(item.productId);
      }
    });
  });

  const productImages = new Map<string, string>();
  if (productIds.size > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, images")
      .in("id", Array.from(productIds));

    products?.forEach((product: any) => {
      if (product.images && product.images.length > 0) {
        productImages.set(product.id.toString(), product.images[0]);
      }
    });
  }

  const ordersWithImages = orders.map((order: any) => {
    return {
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        image: productImages.get(item.productId) || null,
      })),
    };
  });

  return JSON.parse(JSON.stringify(ordersWithImages));
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <AdminOrdersClient initialOrders={orders} />;
}
