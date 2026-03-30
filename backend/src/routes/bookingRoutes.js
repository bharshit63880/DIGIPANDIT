const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const bookingController = require("../controllers/bookingController");
const { createBookingSchema, bookingStatusSchema } = require("../validators/bookingValidators");

const router = express.Router();

router.post("/", protect, validate(createBookingSchema), bookingController.createBooking);
router.get("/me", protect, bookingController.listMyBookings);
router.get("/:bookingId", protect, bookingController.getBookingById);
router.patch("/:bookingId/status", protect, validate(bookingStatusSchema), bookingController.updateBookingStatus);

module.exports = router;
