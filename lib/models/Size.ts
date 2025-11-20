import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISize extends Document {
  name: string;
  value: string; // For filtering (e.g., "small", "large")
  order: number; // For sorting sizes in order
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new Schema<ISize>(
  {
    name: { type: String, required: true, unique: true },
    value: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 }, // Lower numbers appear first
  },
  {
    timestamps: true,
  }
);

// Create index for order (value already has index from unique: true)
SizeSchema.index({ order: 1 });

const Size: Model<ISize> =
  mongoose.models.Size || mongoose.model<ISize>("Size", SizeSchema);

export default Size;
