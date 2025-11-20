import { Suspense } from "react";
import AdminProductsClient from "@/components/Admin/AdminProductsClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

async function getProducts() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminProductsClient initialProducts={products} />
    </Suspense>
  );
}
