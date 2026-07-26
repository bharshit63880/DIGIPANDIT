const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ["PUJA_KIT", "IDOL", "INCENSE", "BOOK"],
      required: true,
    },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
