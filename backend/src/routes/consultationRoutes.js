const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const astrologyController = require("../controllers/astrologyController");
const {
  listAstrologersSchema,
  startSessionSchema,
  endSessionSchema,
} = require("../validators/consultationValidators");
const { createKundaliSchema } = require("../validators/astrologyValidators");

const router = express.Router();

router.get("/astrologers", validate(listAstrologersSchema), astrologyController.listAstrologers);
router.post("/start-session", protect, validate(startSessionSchema), astrologyController.startSession);
router.post("/end-session", protect, validate(endSessionSchema), astrologyController.endSession);
router.post("/kundali", validate(createKundaliSchema), astrologyController.createKundali);

module.exports = router;
