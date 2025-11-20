import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Clock, Plus, Settings, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [totalOrders, pendingOrders, totalProducts] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "Pending" }),
    Product.countDocuments(),
  ]);

  return { totalOrders, pendingOrders, totalProducts };
}

export default async function AdminDashboard() {
  const { totalOrders, pendingOrders, totalProducts } = await getStats();

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      description: "All time orders",
      icon: ShoppingBag,
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      description: "Awaiting processing",
      icon: Clock,
    },
    {
      title: "Total Products",
      value: totalProducts,
      description: "Active products",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl  text-textPrimary font-bold">Dashboard</h1>
        <p className="text-sm text-textSecondary mt-2">
          Overview of your store performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold text-textSecondary">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-textSecondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-medium text-textSecondary">
                  {stat.value}
                </div>
                <CardDescription className="text-sm mt-">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/admin/products?action=add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/products">
                <Settings className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/orders">
                <Eye className="mr-2 h-4 w-4" />
                View Orders
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
