const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const panditRoutes = require("./panditRoutes");
const bookingRoutes = require("./bookingRoutes");
const productRoutes = require("./productRoutes");
const storeRoutes = require("./storeRoutes");
const chatRoutes = require("./chatRoutes");
const paymentRoutes = require("./paymentRoutes");
const adminRoutes = require("./adminRoutes");
const uploadRoutes = require("./uploadRoutes");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/pandits", panditRoutes);
router.use("/bookings", bookingRoutes);
router.use("/products", productRoutes);
router.use("/store", storeRoutes);
router.use("/chat", chatRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/uploads", uploadRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
