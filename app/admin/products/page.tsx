import { Suspense } from "react";
import AdminProductsClient from "@/components/Admin/AdminProductsClient";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function mapProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    _id: p.id,
    discountType: p.discount_type,
    orderCount: p.order_count,
    totalStock: p.total_stock,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function mapCategory(c: any) {
  if (!c) return c;
  return {
    ...c,
    _id: c.id,
    discountType: c.discount_type,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

async function getProducts() {
  const { data: rawProducts, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (productsError) throw productsError;

  const products = (rawProducts || []).map(mapProduct);
  
  // Fetch categories for discount calculation
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("name, discount, discount_type");

  const categories = (rawCategories || []).map(mapCategory);
  const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

  // Apply category discounts to products
  const productsWithDiscounts = products.map((product: any) => {
    if (product.category && categoryMap.has(product.category)) {
      const cat = categoryMap.get(product.category);
      if (cat && cat.discount && cat.discount > 0) {
        product.categoryDiscount = cat.discount;
        product.categoryDiscountType = cat.discountType || "percentage";
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
