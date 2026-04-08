const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  images: { type: [String], required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  description: String,
  stock: { type: Number, default: 1 },
});

module.exports = mongoose.model("Product", productSchema);