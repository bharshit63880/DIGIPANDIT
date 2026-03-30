const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createStoreOrderSchema } = require("../validators/storeValidators");
const storeController = require("../controllers/storeController");

const router = express.Router();

router.post("/orders", protect, validate(createStoreOrderSchema), storeController.createStoreOrder);
router.get("/orders/me", protect, storeController.listMyOrders);
router.get("/orders/:orderId", protect, storeController.getOrderById);

module.exports = router;
