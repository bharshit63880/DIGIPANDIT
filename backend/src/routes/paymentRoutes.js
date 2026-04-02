const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createPaymentSchema, verifyPaymentSchema, failPaymentSchema } = require("../validators/paymentValidators");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", protect, validate(createPaymentSchema), paymentController.createPaymentOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), paymentController.verifyPayment);
router.post("/fail", protect, validate(failPaymentSchema), paymentController.failPayment);
router.post("/payu/callback", paymentController.payuCallback);

module.exports = router;
