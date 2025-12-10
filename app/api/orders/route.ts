import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";

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
    await connectDB();

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
    // If no token provided, skip reCAPTCHA verification (for development/localhost)

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
    const itemsToProcess = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
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
        productId: (product._id as any).toString(),
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });

      // Store item data for stock update
      itemsToProcess.push(item);
    }

    // Use MongoDB session for transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct stock for all items (within transaction)
      for (const item of itemsToProcess) {
        // Refetch product within session for transaction
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 400 }
          );
        }

        const variant = product.variants.find(
          (v: any) => v.color === item.color
        );
        if (!variant) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Variant not found for product ${product.title}` },
            { status: 400 }
          );
        }

        const sizeVariant = variant.sizes.find(
          (s: any) => s.size === item.size
        );
        if (!sizeVariant) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Size ${item.size} not available for ${product.title}` },
            { status: 400 }
          );
        }

        // Double-check stock before deducting (prevent race condition)
        if (sizeVariant.stock < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            {
              error: `Insufficient stock for ${product.title} - ${item.color} - ${item.size}. Available: ${sizeVariant.stock}`,
            },
            { status: 400 }
          );
        }

        // Deduct stock
        sizeVariant.stock -= item.quantity;
        await product.save({ session });
      }

      // Create order
      const order = new Order({
        items: validatedItems,
        customer,
        totalAmount,
        status: "Pending",
      });

      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        { order: { id: order._id, totalAmount: order.totalAmount } },
        { status: 201 }
      );
    } catch (transactionError: any) {
      // Rollback transaction on error
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
