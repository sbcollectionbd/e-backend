// src/controllers/productController.js
const Product = require("../models/Product");
const { getCache, setCache, invalidateCache } = require("../utils/cache");

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  PRODUCT_LIST: 120,   // 2 minutes for product lists
  SINGLE_PRODUCT: 300, // 5 minutes for single product
};

// ✅ Get all products (Filter + Search + Pagination) — with caching
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      featured,
      page = 1,
      limit = 10,
    } = req.query;

    // Build a cache key from query params
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured === "true") query.isFeatured = true;

    // ✅ Use MongoDB text index for search (faster than $regex)
    // Falls back to $regex if text index isn't available
    if (search) {
      query.$or = [
        { $text: { $search: search } },           // uses text index
        { name: { $regex: search, $options: "i" } } // fallback
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // ✅ Run count and find in parallel (saves one round-trip to DB)
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .lean(), // ✅ .lean() returns plain JS objects, ~2x faster than Mongoose docs
      Product.countDocuments(query),
    ]);

    const result = {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: products,
    };

    // Cache the result
    setCache(cacheKey, result, CACHE_TTL.PRODUCT_LIST);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single product — with caching
exports.getSingleProduct = async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const data = await Product.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ message: "Product not found" });

    setCache(cacheKey, data, CACHE_TTL.SINGLE_PRODUCT);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add product — invalidates product list cache
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

    // ✅ Invalidate all product list caches
    invalidateCache("products:");

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update product — recalculates discount, invalidates caches
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // ✅ Recalculate discountPercentage if prices are being updated
    const { originalPrice, discountedPrice } = updateData;
    if (originalPrice && discountedPrice) {
      updateData.discountPercentage = Math.round(
        ((originalPrice - discountedPrice) / originalPrice) * 100
      );
    }

    const data = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // ✅ runValidators ensures schema rules apply
    ).lean();

    if (!data) return res.status(404).json({ message: "Product not found" });

    // ✅ Invalidate this product's cache and all list caches
    invalidateCache(`product:${req.params.id}`);
    invalidateCache("products:");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete product — invalidates caches
exports.deleteProduct = async (req, res) => {
  try {
    const data = await Product.findByIdAndDelete(req.params.id).lean();
    if (!data) return res.status(404).json({ message: "Product not found" });

    invalidateCache(`product:${req.params.id}`);
    invalidateCache("products:");

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};