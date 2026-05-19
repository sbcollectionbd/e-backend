const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("Connecting to DB...");
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ✅ Connection pool: allows up to 10 simultaneous DB operations
      maxPoolSize: 10,
      // ✅ Don't wait more than 5s to get a connection from pool
      serverSelectionTimeoutMS: 5000,
      // ✅ Keep socket alive to avoid dropped idle connections
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

// ✅ Log if connection drops (helps diagnose slowdowns)
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
});

module.exports = connectDB;