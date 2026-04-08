// src/controllers/productController.js
const Product = require("../models/Product");

// // 🔹 Get all products
// exports.getProducts = async (req, res) => {
//   const data = await Product.find();
//   res.json(data);
// };

// 🔹 Get single product (details page er jonno)
exports.getSingleProduct = async (req, res) => {
  try {
    const data = await Product.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Product not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Add product
exports.addProduct = async (req, res) => {
  try {
    const { originalPrice, discountedPrice, isFeatured } = req.body;

    let discountPercentage = 0;
    if (originalPrice && discountedPrice) {
      discountPercentage = Math.round(
        ((originalPrice - discountedPrice) / originalPrice) * 100
      );
    }

    const product = await Product.create({
      ...req.body,
      discountPercentage,
      isFeatured: isFeatured || false,
      images: req.body.images || [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update product
exports.updateProduct = async (req, res) => {
  try {
    const data = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // updated data return korbe
    );

    if (!data) return res.status(404).json({ message: "Product not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const data = await Product.findByIdAndDelete(req.params.id);

    if (!data) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get all products (Filter + Search + Pagination)
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      featured, // ✅ add this
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // ✅ Category filter
    if (category) {
      query.category = category;
    }

    // ✅ Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // ✅ Search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // ✅ Featured filter
    if (featured === "true") {
      query.isFeatured = true;
    }

    // ✅ Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: products
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};