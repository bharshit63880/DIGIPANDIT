const express = require("express");
const validate = require("../middleware/validate");
const astrologyController = require("../controllers/astrologyController");
const { createKundaliSchema, matchingSchema, numerologySchema } = require("../validators/astrologyValidators");

const router = express.Router();

router.post("/kundali", validate(createKundaliSchema), astrologyController.createKundali);
router.get("/daily", astrologyController.getDailyAstrology);
router.get("/cities", astrologyController.searchCities);
router.post("/matching", validate(matchingSchema), astrologyController.createMatch);
router.post("/numerology", validate(numerologySchema), astrologyController.createNumerology);

module.exports = router;
