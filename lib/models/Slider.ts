import mongoose from "mongoose";

const SliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [60, "Title cannot be more than 60 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [200, "Description cannot be more than 200 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL"],
    },
    link: {
      type: String,
      required: [true, "Please provide a link URL"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Slider || mongoose.model("Slider", SliderSchema);
