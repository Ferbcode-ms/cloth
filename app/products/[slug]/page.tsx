import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import RelatedProducts from "@/components/products/details/RelatedProducts";
import { calculateProductPrice } from "@/lib/utils/price";

export const revalidate = 3600; // Revalidate every hour

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

async function getProduct(slug: string) {
  try {
    const { data: rawProduct, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !rawProduct) return null;
    const product = mapProduct(rawProduct);

    // Fetch category for discount calculation
    const { data: rawCategory } = await supabase
      .from("categories")
      .select("*")
      .eq("name", product.category)
      .maybeSingle();

    const category = mapCategory(rawCategory);
    
    // Generate a map for the single category
    const categoryMap = new Map();
    if (category) {
      categoryMap.set(category.name, category);
    }
    
    // Calculate Discount
    const calculatedProduct = calculateProductPrice(product, categoryMap);
    Object.assign(product, calculatedProduct);

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product:", (error as any)?.message || error);
    return null;
  }
}

async function getRelatedProducts(category: string, currentProductId: string) {
  try {
    const { data: rawProducts, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", currentProductId)
      .limit(4);

    if (error) throw error;
    const products = (rawProducts || []).map(mapProduct);

    // Fetch category for discount calculation
    const { data: rawCategory } = await supabase
      .from("categories")
      .select("*")
      .eq("name", category)
      .maybeSingle();

    const categoryData = mapCategory(rawCategory);

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
    console.error("Error fetching related products:", (error as any)?.message || error);
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
