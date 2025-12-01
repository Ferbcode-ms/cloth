import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { verifyAuth } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const skip = (page - 1) * limit;

    const query: any = {};
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Fetch all categories to apply category-level discounts
    const categories = await Category.find({}).select("name discount discountType").lean();
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    const productsWithDiscounts = products.map((product: any) => {
      let finalPrice = product.price;
      let discountAmount = 0;
      let hasDiscount = false;
      let appliedDiscount = 0;
      let appliedDiscountType = "percentage";

      // 1. Check Product Discount
      if (product.discount > 0) {
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
      else if (product.category && categoryMap.has(product.category)) {
        const cat = categoryMap.get(product.category);
        if (cat && cat.discount > 0) {
          hasDiscount = true;
          appliedDiscount = cat.discount;
          appliedDiscountType = cat.discountType || "percentage";
          
          // Attach discount info to product so UI can show it
          product.discount = appliedDiscount;
          product.discountType = appliedDiscountType;

          if (appliedDiscountType === "fixed") {
            discountAmount = appliedDiscount;
          } else {
            discountAmount = (product.price * appliedDiscount) / 100;
          }
        }
      }

      if (hasDiscount) {
        finalPrice = Math.max(0, product.price - discountAmount);
        return {
          ...product,
          originalPrice: product.price, // Set original price to the database price
          price: finalPrice, // Set current price to the discounted price
        };
      }

      return product;
    });

    return NextResponse.json({
      products: productsWithDiscounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      subcategory,
      images,
      variants,
      discount,
      discountType,
    } = body;

    // Validate required fields
    if (!title || !description || price === undefined || !category) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, price, or category",
        },
        { status: 400 }
      );
    }

    // Validate images array
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Validate variants array
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }

    // Validate each variant has color and sizes
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.color) {
        return NextResponse.json(
          { error: `Variant ${i + 1} is missing color` },
          { status: 400 }
        );
      }
      if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
        return NextResponse.json(
          { error: `Variant ${i + 1} must have at least one size` },
          { status: 400 }
        );
      }
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = new Product({
      title,
      description,
      price,
      category,
      subcategory: subcategory || undefined,
      images,
      variants,
      slug,
      discount: discount || 0,
      discountType: discountType || "percentage",
    });

    await product.save();

    return NextResponse.json(
      { product: JSON.parse(JSON.stringify(product)) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Product with this title already exists" },
        { status: 400 }
      );
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

