const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    size:{ type: String, required: false },
    items: { type: Array, required: true },
    totalPrice: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// ✅ Index for fast order tracking by phone
orderSchema.index({ phone: 1 });
orderSchema.index({ createdAt: -1 }); // for sorting in getOrders

module.exports = mongoose.model("Order", orderSchema);