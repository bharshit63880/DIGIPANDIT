const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

router.post("/image", protect, upload.single("image"), uploadController.uploadSingleImage);
router.post("/audio", protect, authorize("ADMIN"), upload.audio.single("audio"), uploadController.uploadSingleAudio);

module.exports = router;
