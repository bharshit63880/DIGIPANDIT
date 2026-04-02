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
const astrologyRoutes = require("./astrologyRoutes");
const consultationRoutes = require("./consultationRoutes");
const walletRoutes = require("./walletRoutes");
const panditBookingRoutes = require("./panditBookingRoutes");

const router = express.Router();

router.use("/", consultationRoutes);
router.use("/", walletRoutes);
router.use("/", panditBookingRoutes);
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
router.use("/astrology", astrologyRoutes);

module.exports = router;
