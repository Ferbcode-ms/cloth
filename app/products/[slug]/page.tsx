import Image from "next/image";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 3600; // Revalidate every hour

async function getProduct(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
