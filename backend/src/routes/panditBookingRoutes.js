const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const panditBookingController = require("../controllers/panditBookingController");
const {
  bookPanditSchema,
  listPanditServicesSchema,
} = require("../validators/panditBookingValidators");

const router = express.Router();

router.get("/pandit-services", validate(listPanditServicesSchema), panditBookingController.listPanditServices);
router.post("/book-pandit", protect, validate(bookPanditSchema), panditBookingController.bookPandit);

module.exports = router;
