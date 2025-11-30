import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariantSize {
  size: string;
  stock: number;
}

export interface IProductVariant {
  color: string;
  sizes: IProductVariantSize[];
}

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string; // Category name or ID
  subcategory?: string; // Subcategory name or slug
  images: string[];
  variants: IProductVariant[];
  slug: string;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSizeSchema = new Schema<IProductVariantSize>({
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
});

const ProductVariantSchema = new Schema<IProductVariant>({
  color: { type: String, required: true },
  sizes: [ProductVariantSizeSchema],
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    subcategory: { type: String },
    images: [{ type: String, required: true }],
    variants: [ProductVariantSchema],
    slug: { type: String, required: true, unique: true, index: true },
    orderCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
ProductSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Create indexes for frequently queried fields
ProductSchema.index({ category: 1 });
ProductSchema.index({ subcategory: 1 });
ProductSchema.index(
  { title: "text", description: "text" },
  {
    weights: { title: 5, description: 1 },
    name: "ProductTextSearch",
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
