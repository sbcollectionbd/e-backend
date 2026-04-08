const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();



// DB connect
connectDB();

// Middlewares
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://www.sbcollectionbd.com",
    "https://e-frontend-lemon.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

module.exports = app;