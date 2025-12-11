import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import RelatedProducts from "@/components/products/details/RelatedProducts";

export const revalidate = 3600; // Revalidate every hour

import Category from "@/lib/models/Category";
import { calculateProductPrice } from "@/lib/utils/price";

async function getProduct(slug: string) {
  try {
    await connectDB();
    const product: any = await Product.findOne({ slug }).lean();
    if (!product) return null;

    // Fetch category for discount calculation
    const category: any = await Category.findOne({ name: product.category }).lean();
    
    // Generate a simple map for the single category
    const categoryMap = new Map();
    if (category) {
      categoryMap.set(category.name, category);
    }
    
    // Calculate Discount
    const calculatedProduct = calculateProductPrice(product, categoryMap);
    Object.assign(product, calculatedProduct);

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

    // Fetch category for discount calculation (we already know the category name)
    const categoryData: any = await Category.findOne({ name: category }).lean();

    // Helper map
    const categoryMap = new Map();
    if (categoryData) {
      categoryMap.set(categoryData.name, categoryData);
    }

    const productsWithDiscounts = products.map((product: any) => {
      return calculateProductPrice(product, categoryMap);
    });

    return JSON.parse(JSON.stringify(productsWithDiscounts));
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

  const relatedProducts = await getRelatedProducts(product.category, product._id);

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
      <ProductDetailClient product={product} />
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
