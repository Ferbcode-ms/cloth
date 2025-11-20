import mongoose, { Schema, Document, Model } from "mongoose";

export interface IColor extends Document {
  name: string;
  value: string; // For filtering (e.g., "green", "red")
  hex: string; // Hex color code (e.g., "#22c55e")
  createdAt: Date;
  updatedAt: Date;
}

const ColorSchema = new Schema<IColor>(
  {
    name: { type: String, required: true, unique: true },
    value: { type: String, required: true, unique: true },
    hex: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Note: value field already has an index from unique: true

const Color: Model<IColor> =
  mongoose.models.Color || mongoose.model<IColor>("Color", ColorSchema);

export default Color;
