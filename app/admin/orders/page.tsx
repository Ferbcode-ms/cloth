import AdminOrdersClient from "@/components/Admin/AdminOrdersClient";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";

export const dynamic = "force-dynamic";

async function getOrders() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <AdminOrdersClient initialOrders={orders} />;
}
