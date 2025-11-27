import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";
import RelatedProducts from "@/components/product/RelatedProducts";

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

async function getRelatedProducts(category: string, currentProductId: string) {
  try {
    await connectDB();
    const products = await Product.find({
      category,
      _id: { $ne: currentProductId },
    })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.title} | Clothing Store`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.substring(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

import Color from "@/lib/models/Color";

// ... existing imports

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

  const [relatedProducts, colors] = await Promise.all([
    getRelatedProducts(product.category, product._id),
    Color.find().lean(),
  ]);

  const colorMap = colors.reduce((acc: Record<string, string>, color: any) => {
    acc[color.name] = color.hex;
    // Also map by value just in case
    acc[color.value] = color.hex;
    return acc;
  }, {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} colorMap={colorMap} />
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
