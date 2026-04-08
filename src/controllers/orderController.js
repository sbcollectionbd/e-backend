// src/controllers/orderController.js
const Order = require("../models/Order");
const sendSMS = require("../services/smsService");

exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      items,
      totalPrice,
      deliveryCharge,
    } = req.body;

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone" });
    }

    const order = await Order.create({
      customerName,
      phone,
      address,
      items,
      totalPrice,
      deliveryCharge,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status + SMS
exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  let msg = "";
  if (status === "Confirmed") msg = "Order confirmed ✅";
  if (status === "Shipped") msg = "Order shipped 🚚";
  if (status === "Delivered") msg = "Order delivered 🎉";

  if (msg) await sendSMS(order.phone, msg);

  res.json(order);
};

exports.trackOrder = async (req, res) => {
  try {
    const orders = await Order.find({
      phone: req.params.phone,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const data = await Order.find();
  res.json(data);
};