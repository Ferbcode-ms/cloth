import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubcategory {
  name: string;
  slug: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string; // Optional image URL for category
  discount?: number;
  discountType?: "percentage" | "fixed";
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
});

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String, required: false }, // Optional image URL
    discount: { type: Number, default: 0, min: 0 },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    subcategories: [SubcategorySchema],
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
CategorySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Generate slug for subcategories
SubcategorySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
