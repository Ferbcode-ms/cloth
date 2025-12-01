import { Suspense } from "react";
import AdminProductsClient from "@/components/Admin/AdminProductsClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

export const dynamic = "force-dynamic";

async function getProducts() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  
  // Fetch categories for discount calculation
  const categories = await Category.find({}).select("name discount discountType").lean();
  const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

  // Apply category discounts to products that don't have their own discount
  const productsWithDiscounts = products.map((product: any) => {
    // If product doesn't have its own discount, check category discount
    if ((!product.discount || product.discount === 0) && product.category && categoryMap.has(product.category)) {
      const cat = categoryMap.get(product.category);
      if (cat && cat.discount && cat.discount > 0) {
        product.discount = cat.discount;
        product.discountType = cat.discountType || "percentage";
      }
    }
    return product;
  });

  return JSON.parse(JSON.stringify(productsWithDiscounts));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminProductsClient initialProducts={products} />
    </Suspense>
  );
}
