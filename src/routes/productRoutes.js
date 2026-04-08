// src/routes/productRoutes.js
const router = require("express").Router();

const {
  getProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// GET all
router.get("/", getProducts);

// GET single
router.get("/:id", getSingleProduct);

// POST
router.post("/", addProduct);

// UPDATE
router.patch("/:id", updateProduct);

// DELETE
router.delete("/:id", deleteProduct);

module.exports = router;