import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not set");
    return false;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, recaptchaToken } = body;

    // Verify reCAPTCHA token (optional - skip if empty or not provided)
    if (recaptchaToken && recaptchaToken.trim() !== "") {
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      return NextResponse.json(
        { error: "Customer information is incomplete" },
        { status: 400 }
      );
    }

    // Validate items and check stock (first pass - validation only)
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // Fetch product by ID
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .maybeSingle();

      if (fetchError || !product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      // Find variant
      const variant = product.variants.find((v: any) => v.color === item.color);
      if (!variant) {
        return NextResponse.json(
          { error: `Variant not found for product ${product.title}` },
          { status: 400 }
        );
      }

      // Find size
      const sizeVariant = variant.sizes.find((s: any) => s.size === item.size);
      if (!sizeVariant) {
        return NextResponse.json(
          { error: `Size ${item.size} not available for ${product.title}` },
          { status: 400 }
        );
      }

      // Check stock
      if (sizeVariant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.title} - ${item.color} - ${item.size}. Available: ${sizeVariant.stock}`,
          },
          { status: 400 }
        );
      }

      totalAmount += product.price * item.quantity;

      validatedItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });
    }

    // Call PostgreSQL atomic transaction function in Supabase
    const { data: txResult, error: txError } = await supabase.rpc(
      "place_order_transaction",
      {
        p_items: validatedItems,
        p_customer: customer,
        p_total_amount: totalAmount,
      }
    );

    if (txError) {
      throw txError;
    }

    if (txResult && txResult.success === false) {
      return NextResponse.json(
        { error: txResult.error || "Failed to place order due to stock or validation issue" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { order: { id: txResult.orderId, totalAmount } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
