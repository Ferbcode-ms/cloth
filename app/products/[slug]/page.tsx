import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";
import RelatedProducts from "@/components/product/RelatedProducts";

export const revalidate = 3600; // Revalidate every hour

import Category from "@/lib/models/Category";

async function getProduct(slug: string) {
  try {
    await connectDB();
    const product: any = await Product.findOne({ slug }).lean();
    if (!product) return null;

    // Fetch category for discount calculation
    const category: any = await Category.findOne({ name: product.category }).lean();
    
    // Calculate Discount
    let finalPrice = product.price;
    let discountAmount = 0;
    let hasDiscount = false;
    let appliedDiscount = 0;
    let appliedDiscountType = "percentage";

    // 1. Check Product Discount
    if (product.discount && product.discount > 0) {
      hasDiscount = true;
      appliedDiscount = product.discount;
      appliedDiscountType = product.discountType || "percentage";
      
      if (appliedDiscountType === "fixed") {
        discountAmount = appliedDiscount;
      } else {
        discountAmount = (product.price * appliedDiscount) / 100;
      }
    } 
    // 2. Check Category Discount (only if no product discount)
    else if (category && category.discount && category.discount > 0) {
      hasDiscount = true;
      appliedDiscount = category.discount;
      appliedDiscountType = category.discountType || "percentage";
      
      // Attach discount info
      product.discount = appliedDiscount;
      product.discountType = appliedDiscountType as any;

      if (appliedDiscountType === "fixed") {
        discountAmount = appliedDiscount;
      } else {
        discountAmount = (product.price * appliedDiscount) / 100;
      }
    }

    if (hasDiscount) {
      finalPrice = Math.max(0, product.price - discountAmount);
      product.originalPrice = product.price;
      product.price = finalPrice;
    }

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

    const productsWithDiscounts = products.map((product: any) => {
      let finalPrice = product.price;
      let discountAmount = 0;
      let hasDiscount = false;
      let appliedDiscount = 0;
      let appliedDiscountType = "percentage";

      // 1. Check Product Discount
      if (product.discount && product.discount > 0) {
        hasDiscount = true;
        appliedDiscount = product.discount;
        appliedDiscountType = product.discountType || "percentage";
        
        if (appliedDiscountType === "fixed") {
          discountAmount = appliedDiscount;
        } else {
          discountAmount = (product.price * appliedDiscount) / 100;
        }
      } 
      // 2. Check Category Discount
      else if (categoryData && categoryData.discount && categoryData.discount > 0) {
        hasDiscount = true;
        appliedDiscount = categoryData.discount;
        appliedDiscountType = categoryData.discountType || "percentage";
        
        // Attach discount info
        product.discount = appliedDiscount;
        product.discountType = appliedDiscountType;

        if (appliedDiscountType === "fixed") {
          discountAmount = appliedDiscount;
        } else {
          discountAmount = (product.price * appliedDiscount) / 100;
        }
      }

      if (hasDiscount) {
        finalPrice = Math.max(0, product.price - discountAmount);
        product.originalPrice = product.price;
        product.price = finalPrice;
      }
      
      return product;
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
