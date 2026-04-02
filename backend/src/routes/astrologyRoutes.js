const express = require("express");
const validate = require("../middleware/validate");
const astrologyController = require("../controllers/astrologyController");
const { createKundaliSchema } = require("../validators/astrologyValidators");

const router = express.Router();

router.post("/kundali", validate(createKundaliSchema), astrologyController.createKundali);

module.exports = router;
