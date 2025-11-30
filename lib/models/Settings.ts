import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    banner: {
      text: {
        type: String,
        default: "Sign up and get 20% off to your first order.",
      },
      linkUrl: {
        type: String,
        default: "/products",
      },
      linkText: {
        type: String,
        default: "Sign Up Now",
      },
      isVisible: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
