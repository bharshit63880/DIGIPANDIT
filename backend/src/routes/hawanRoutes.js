const express = require("express");
const controller = require("../controllers/hawanController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { listSchema, detailSchema, recommendSchema, progressSchema, idParamSchema, muhuratSchema } = require("../validators/hawanValidators");

const router = express.Router();
router.get("/", validate(listSchema), controller.listHawans);
router.get("/categories", controller.getCategories);
router.post("/recommend", validate(recommendSchema), controller.recommendHawans);
router.get("/me/progress", protect, controller.listMyHawans);
router.get("/:hawanId/materials", controller.getMaterials);
router.get("/:hawanId/phases", controller.getPhases);
router.get("/:hawanId/mantras", controller.getMantras);
router.get("/:hawanId/purpose-offerings", controller.getPurposeOfferings);
router.get("/:hawanId/pandits", controller.getPandits);
router.get("/:hawanId/muhurat", validate(muhuratSchema), controller.getMuhurat);
router.get("/:hawanId/progress", protect, controller.getMyProgress);
router.post("/:hawanId/progress", protect, validate(progressSchema), controller.saveProgress);
router.post("/:hawanId/complete", protect, validate(idParamSchema), controller.completeHawan);
router.get("/:slug", validate(detailSchema), controller.getHawanBySlug);

module.exports = router;
