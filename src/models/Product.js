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

// ✅ Indexes for fast filtering & search
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: "text" }); // full-text search index
productSchema.index({ category: 1, subcategory: 1 }); // compound for combined filters

module.exports = mongoose.model("Product", productSchema);